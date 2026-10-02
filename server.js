import express from 'express'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { pool, sql } from './api/_db.js'
import products, { listProducts, findProduct, backfillSlugs, addView } from './api/products.js'
import socials from './api/socials.js'
import settings, { getPublicSettings } from './api/settings.js'
import login from './api/login.js'
import { parseImages } from './api/_lib.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.set('trust proxy', true)
app.disable('x-powered-by')
app.use(express.json({ limit: '25mb' }))

const origin = req => `${req.protocol}://${req.get('host')}`

/* ───────── API ───────── */
app.all('/api/products', products)
app.post('/api/products/:id/view', async (req, res) => {
  try { await addView(req.params.id); res.json({ ok: true }) } catch { res.json({ ok: false }) }
})
app.all('/api/socials', socials)
app.all('/api/settings', settings)
app.all('/api/login', login)
app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'up' }) }
  catch (e) { res.status(500).json({ ok: false, db: 'down', error: e.message }) }
})
app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))

/* ───────── Imágenes optimizadas ─────────
   /img/:id/:n            → WebP (ancho original, máx 1400)
   /img/:id/:n?w=500      → WebP redimensionada
   /img/:id/:n.jpg?w=1200 → JPEG (para vistas previas de WhatsApp/Instagram) */
const imgCache = new Map(); let imgBytes = 0
const IMG_CACHE_MAX = 80 * 1024 * 1024
function cachePut(k, buf) {
  imgCache.set(k, buf); imgBytes += buf.length
  while (imgBytes > IMG_CACHE_MAX && imgCache.size) {
    const [fk, fv] = imgCache.entries().next().value; imgCache.delete(fk); imgBytes -= fv.length
  }
}
app.get('/img/:id/:file', async (req, res) => {
  try {
    const m = req.params.file.match(/^(\d+)(?:\.(jpg|webp))?$/)
    if (!m) return res.status(404).end()
    const n = Number(m[1]), fmt = m[2] === 'jpg' ? 'jpeg' : 'webp'
    const w = Math.min(Math.max(parseInt(req.query.w, 10) || 1400, 80), 1600)
    const key = `${req.params.id}:${n}:${w}:${fmt}:${req.query.v || ''}`
    let buf = imgCache.get(key)
    if (!buf) {
      const row = (await sql`SELECT images, image FROM products WHERE id=${req.params.id}`)[0]
      const src = row && parseImages(row)[n]
      if (!src) return res.status(404).end()
      const raw = Buffer.from(src.split(',')[1] || '', 'base64')
      let pipe = sharp(raw).rotate().resize({ width: w, withoutEnlargement: true })
      buf = fmt === 'jpeg' ? await pipe.jpeg({ quality: 80, mozjpeg: true }).toBuffer() : await pipe.webp({ quality: 78 }).toBuffer()
      cachePut(key, buf)
    }
    res.setHeader('Content-Type', `image/${fmt}`)
    res.setHeader('Cache-Control', req.query.v ? 'public, max-age=31536000, immutable' : 'public, max-age=3600')
    res.end(buf)
  } catch (e) { console.error('img', e.message); res.status(500).end() }
})

/* ───────── SEO: robots + sitemap ───────── */
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nSitemap: ${origin(req)}/sitemap.xml\n`)
})
app.get('/sitemap.xml', async (req, res) => {
  try {
    const o = origin(req)
    const list = await listProducts()
    const pages = ['', '/tienda', '/tienda?cat=sneakers', '/tienda?cat=ropa', '/tienda?cat=accesorios', '/encargos', '/vende', '/vendidos', '/arma-tu-look', '/faq']
    const urls = [
      ...pages.map(p => `<url><loc>${o}${p.replace(/&/g, '&amp;')}</loc></url>`),
      ...list.map(p => `<url><loc>${o}/producto/${p.slug}</loc><lastmod>${new Date(p.created_at).toISOString().slice(0, 10)}</lastmod></url>`),
    ]
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`)
  } catch (e) { res.status(500).send('') }
})

/* ───────── Frontend + metadatos por página ───────── */
const dist = path.join(__dirname, 'dist')
app.use(express.static(dist, {
  index: false,
  setHeaders: (res, file) => {
    if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  },
}))

let template = null
const getTemplate = () => (template ??= fs.readFileSync(path.join(dist, 'index.html'), 'utf8'))
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const DEFAULT_META = {
  title: 'KLOW Streetwear · Sneakers y ropa hype en Argentina',
  description: 'Sneakers y ropa de edición limitada importada de USA. 100% originales, precio en dólares o pesos al blue. Envíos gratis a todo el país.',
}
const PAGE_META = {
  '/tienda': { title: 'Tienda · KLOW Streetwear', description: 'Todo el stock de sneakers, ropa y accesorios hype disponible en KLOW.' },
  '/encargos': { title: 'Encargos · KLOW Streetwear', description: '¿No encontrás lo que buscás? Lo traemos desde USA. Pedí tu encargo por WhatsApp.' },
  '/vende': { title: 'Vendé o cambiá tu prenda · KLOW Streetwear', description: 'Buy · Sell · Trade. Ofrecenos tus sneakers o ropa y te hacemos una oferta.' },
  '/vendidos': { title: 'Vendidos · KLOW Streetwear', description: 'Algunos de los pares y prendas que ya entregamos.' },
  '/arma-tu-look': { title: 'Armá tu look · KLOW Streetwear', description: 'Elegí tu presupuesto y te armamos un outfit completo con nuestro stock.' },
  '/faq': { title: 'Preguntas frecuentes · KLOW Streetwear', description: 'Envíos, pagos, encargos, pre-orders y autenticidad.' },
}

app.get('*', async (req, res) => {
  try {
    const o = origin(req)
    let meta = { ...DEFAULT_META, image: `${o}/og-default.jpg`, url: `${o}${req.path}`, type: 'website' }
    let extra = ''
    const pm = req.path.match(/^\/producto\/([^/]+)/)
    if (pm) {
      const p = await findProduct(decodeURIComponent(pm[1])).catch(() => null)
      if (p) {

        meta = {
          title: `${p.name}${p.brand ? ' · ' + p.brand : ''} · USD ${p.price} | KLOW`,
          description: (p.description || `${p.name} — USD ${p.price}. ${p.availability === 'preorder' ? 'Pre-order.' : 'Entrega inmediata.'} 100% original. Envíos gratis a todo el país.`).slice(0, 200),
          image: p.images[0] ? `${o}${p.images[0].replace(/\/(\d+)\?/, '/$1.jpg?')}&w=1200` : meta.image,
          url: `${o}/producto/${p.slug}`,
          type: 'product',
        }
        const ld = {
          '@context': 'https://schema.org', '@type': 'Product', name: p.name,
          brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
          image: p.images.map(i => `${o}${i}`), description: p.description || p.name, sku: p.id,
          offers: {
            '@type': 'Offer', priceCurrency: 'USD', price: p.price, url: meta.url,
            availability: p.sold || Number(p.stock) <= 0 ? 'https://schema.org/SoldOut' : p.availability === 'preorder' ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
          },
        }
        extra = `<meta property="product:price:amount" content="${p.price}"><meta property="product:price:currency" content="USD"><script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`
      }
    } else if (PAGE_META[req.path]) {
      meta = { ...meta, ...PAGE_META[req.path] }
    }
    const tags = `<title>${esc(meta.title)}</title>
    <meta name="description" content="${esc(meta.description)}">
    <link rel="canonical" href="${esc(meta.url)}">
    <meta property="og:site_name" content="KLOW Streetwear">
    <meta property="og:locale" content="es_AR">
    <meta property="og:type" content="${meta.type}">
    <meta property="og:title" content="${esc(meta.title)}">
    <meta property="og:description" content="${esc(meta.description)}">
    <meta property="og:image" content="${esc(meta.image)}">
    <meta property="og:url" content="${esc(meta.url)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(meta.title)}">
    <meta name="twitter:description" content="${esc(meta.description)}">
    <meta name="twitter:image" content="${esc(meta.image)}">${extra}`
    const html = getTemplate().replace(/<title>[\s\S]*?<\/title>/, '').replace('<!--META-->', tags)
    res.setHeader('Cache-Control', 'no-cache')
    res.send(html)
  } catch (e) {
    console.error('render', e.message)
    res.sendFile(path.join(dist, 'index.html'))
  }
})

/* ───────── Inicio ───────── */
async function initDb() {
  try {
    await pool.query(fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8'))
    await backfillSlugs()
    console.log('✅ Base de datos lista')
  } catch (e) { console.error('❌ No se pudo inicializar la base:', e.message) }
}
initDb().finally(() => app.listen(PORT, '0.0.0.0', () => console.log(`🚀 KLOW corriendo en el puerto ${PORT}`)))
