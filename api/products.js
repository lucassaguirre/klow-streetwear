import { sql } from './_db.js'
import { randomUUID } from 'crypto'
import { slugify, parseImages, cache } from './_lib.js'
import { ensureBrand } from './brands.js'

// Columnas livianas (sin las fotos en base64)
const LIGHT = `id, slug, name, brand, price, sizes, stock, category, description,
  availability, preorder_days, sold, views, created_at, updated_at,
  CASE WHEN images IS NOT NULL AND images <> '' AND images <> '[]' THEN json_array_length(images::json)
       WHEN image IS NOT NULL AND image <> '' THEN 1 ELSE 0 END AS img_count`

function toPublic(r) {
  const v = new Date(r.updated_at || r.created_at || Date.now()).getTime()
  return {
    id: r.id,
    slug: r.slug || r.id,
    name: r.name,
    brand: r.brand || '',
    price: Number(r.price),
    sizes: r.sizes || '',
    stock: String(r.stock ?? 0),
    category: r.category || 'ropa',
    description: r.description || '',
    availability: r.availability || 'inmediata',
    preorder_days: r.preorder_days || '',
    sold: !!r.sold,
    views: r.views || 0,
    created_at: r.created_at,
    images: Array.from({ length: Number(r.img_count) || 0 }, (_, i) => `/img/${r.id}/${i}?v=${v}`),
  }
}

export async function listProducts() {
  const hit = cache.get(); if (hit) return hit
  const rows = await sql([`SELECT ${LIGHT} FROM products ORDER BY created_at DESC`])
  const list = rows.map(toPublic)
  cache.set(list)
  return list
}

export async function findProduct(idOrSlug) {
  const list = await listProducts()
  return list.find(p => p.slug === idOrSlug || p.id === idOrSlug) || null
}

async function uniqueSlug(name, excludeId = null) {
  const base = slugify(name)
  let slug = base, n = 2
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const r = await sql`SELECT id FROM products WHERE slug=${slug}`
    if (!r.length || r[0].id === excludeId) return slug
    slug = `${base}-${n++}`
  }
}

// Acepta: data:image/... (nueva) o /img/<id>/<n> (existente, se resuelve a la guardada)
function resolveImages(incoming = [], stored = []) {
  return incoming.slice(0, 5).map(s => {
    if (typeof s !== 'string') return null
    if (s.startsWith('data:image/')) return s
    const m = s.match(/\/img\/[^/]+\/(\d+)/)
    return m ? stored[Number(m[1])] || null : null
  }).filter(Boolean)
}

function clean(b) {
  return {
    name: String(b.name || '').trim(),
    brand: String(b.brand || '').trim(),
    price: Number(b.price) || 0,
    sizes: String(b.sizes || '').trim(),
    stock: parseInt(b.stock, 10) || 0,
    category: ['sneakers', 'ropa', 'accesorios'].includes(b.category) ? b.category : 'ropa',
    description: String(b.description || ''),
    availability: b.availability === 'preorder' ? 'preorder' : 'inmediata',
    preorder_days: String(b.preorder_days || '').trim(),
    sold: !!b.sold,
  }
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return res.status(200).json(await listProducts())

    if (req.method === 'POST') {
      const b = clean(req.body || {})
      if (!b.name || !b.price) return res.status(400).json({ error: 'Faltan nombre o precio' })
      b.brand = await ensureBrand(b.brand)
      const id = randomUUID()
      const slug = await uniqueSlug(b.name)
      const images = JSON.stringify(resolveImages(req.body.images || []))
      await sql`INSERT INTO products (id,slug,name,brand,price,sizes,stock,images,category,description,availability,preorder_days,sold,updated_at)
        VALUES (${id},${slug},${b.name},${b.brand},${b.price},${b.sizes},${b.stock},${images},${b.category},${b.description},${b.availability},${b.preorder_days},${b.sold},now())`
      cache.clear()
      return res.status(200).json(await findProduct(id))
    }

    if (req.method === 'PUT') {
      const { id } = req.query; if (!id) return res.status(400).json({ error: 'Falta id' })
      const cur = (await sql`SELECT images, image FROM products WHERE id=${id}`)[0]
      if (!cur) return res.status(404).json({ error: 'No existe' })
      const b = clean(req.body || {})
      b.brand = await ensureBrand(b.brand)
      // Si solo cambia "vendido" u otros campos sin mandar fotos, se conservan
      const images = Array.isArray(req.body.images)
        ? JSON.stringify(resolveImages(req.body.images, parseImages(cur)))
        : JSON.stringify(parseImages(cur))
      await sql`UPDATE products SET name=${b.name},brand=${b.brand},price=${b.price},sizes=${b.sizes},stock=${b.stock},
        images=${images},image='',category=${b.category},description=${b.description},availability=${b.availability},
        preorder_days=${b.preorder_days},sold=${b.sold},updated_at=now() WHERE id=${id}`
      cache.clear()
      return res.status(200).json(await findProduct(id))
    }

    if (req.method === 'DELETE') {
      const { id } = req.query; if (!id) return res.status(400).json({ error: 'Falta id' })
      await sql`DELETE FROM products WHERE id=${id}`
      cache.clear()
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    return res.status(405).json({ error: 'Método no permitido' })
  } catch (err) { console.error(err); return res.status(500).json({ error: err.message }) }
}

// Asigna slug a productos viejos que no tienen
export async function backfillSlugs() {
  const rows = await sql`SELECT id, name FROM products WHERE slug IS NULL OR slug = ''`
  for (const r of rows) {
    const slug = await uniqueSlug(r.name, r.id)
    await sql`UPDATE products SET slug=${slug} WHERE id=${r.id}`
  }
  if (rows.length) { cache.clear(); console.log(`✅ ${rows.length} producto(s) con URL nueva`) }
}

export async function addView(id) {
  await sql`UPDATE products SET views = COALESCE(views,0) + 1 WHERE id=${id}`
  const hit = cache.get()
  if (hit) { const p = hit.find(x => x.id === id); if (p) p.views++ }
}
