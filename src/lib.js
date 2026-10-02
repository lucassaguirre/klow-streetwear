/* ═══ Utilidades compartidas ═══ */
export const WA_DEFAULT = '5491165830511'
export const CATS = [['sneakers', 'Sneakers'], ['ropa', 'Ropa'], ['accesorios', 'Accesorios']]
export const catLabel = c => (CATS.find(x => x[0] === c) || [, 'Todo'])[1]

export async function api(path, opts = {}) {
  const res = await fetch(`/api/${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts })
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || `Error ${res.status}`) }
  return res.json()
}

export function compressImg(file, max = 1200) {
  return new Promise(res => {
    const im = new Image(), url = URL.createObjectURL(file)
    im.onload = () => {
      const r = Math.min(max / im.width, max / im.height, 1)
      const c = document.createElement('canvas')
      c.width = Math.round(im.width * r); c.height = Math.round(im.height * r)
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.82))
    }
    im.src = url
  })
}

export function parseSocial(raw) {
  const url = raw.trim()
  const tt = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
  if (tt) return { type: 'tiktok', id: tt[1], url }
  const ig = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/)
  if (ig) return { type: 'instagram', id: ig[1], url }
  return null
}

/* Imagen redimensionada desde el servidor (WebP) */
export const img = (u, w = 600) => !u ? '' : u.startsWith('data:') ? u : `${u}${u.includes('?') ? '&' : '?'}w=${w}`

/* Estados */
export const isSold = p => !!p?.sold
export const inStock = p => !isSold(p) && Number(p?.stock) > 0
export const isPre = p => p?.availability === 'preorder'
export const fmtUSD = n => 'USD $' + Number(n || 0).toLocaleString('en-US')

/* ═══ Talles USA → ARG (zapatillas) ═══ */
const US_AR = { 3.5: 34.5, 4: 35, 4.5: 35.5, 5: 36, 5.5: 37, 6: 37.5, 6.5: 38, 7: 39, 7.5: 39.5, 8: 40, 8.5: 41, 9: 41.5, 9.5: 42, 10: 43, 10.5: 43.5, 11: 44, 11.5: 44.5, 12: 45, 12.5: 45.5, 13: 46, 14: 47, 15: 48 }
export const sizesOf = p => (p?.sizes || '').split(/[,/]/).map(s => s.trim()).filter(Boolean)
export function sizeInfo(raw, cat) {
  const s = String(raw).trim()
  if (cat !== 'sneakers') return { us: null, ar: null, label: s }
  const n = parseFloat(s.replace(',', '.').replace(/us|usa/i, ''))
  if (isNaN(n)) return { us: null, ar: null, label: s }
  if (n <= 16) { const ar = US_AR[n]; return { us: n, ar, label: ar ? `${n} US · ${ar} AR` : `${n} US` } }
  return { us: null, ar: n, label: `${n} AR` }
}
export const sizeLabel = (s, cat) => sizeInfo(s, cat).label

/* ═══ WhatsApp + analytics ═══ */
export const waNum = s => (s || WA_DEFAULT).replace(/\D/g, '')
export function track(event, data = {}) {
  try { window.fbq?.('track', event, data) } catch {}
  try { window.gtag?.('event', event === 'Contact' ? 'contact_whatsapp' : event === 'ViewContent' ? 'view_item' : event, data) } catch {}
}
export function openWA(num, text, data) {
  track('Contact', data)
  window.open(`https://wa.me/${waNum(num)}?text=${encodeURIComponent(text)}`, '_blank')
}
export function productMsg(p, size, deposit = 50) {
  return [
    'Hola! Me gustó esta prenda, ¿sigue en stock?', '',
    `*${p.name}*`,
    size ? `Talle: ${sizeLabel(size, p.category)}` : null,
    `Precio: USD $${p.price}`,
    isPre(p) ? `Modalidad: Pre-order${p.preorder_days ? ` (${p.preorder_days})` : ''} · seña ${deposit}%` : 'Modalidad: Entrega inmediata',
    `${location.origin}/producto/${p.slug}`,
  ].filter(l => l !== null).join('\n')
}

/* ═══ Analytics: Meta Pixel y Google Analytics ═══ */
export function loadAnalytics({ meta_pixel_id, ga_id }) {
  if (meta_pixel_id && !window.fbq) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', meta_pixel_id)
  }
  if (ga_id && !window.gtag) {
    const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${ga_id}`; document.head.appendChild(s)
    window.dataLayer = window.dataLayer || []
    window.gtag = function () { window.dataLayer.push(arguments) }
    window.gtag('js', new Date()); window.gtag('config', ga_id, { send_page_view: false })
  }
}
export function trackPage(path) {
  try { window.fbq?.('track', 'PageView') } catch {}
  try { window.gtag?.('event', 'page_view', { page_path: path, page_location: location.href }) } catch {}
}

/* ═══ Armá tu look ═══ */
export function buildLooks(items, budget) {
  const pool = items.filter(p => inStock(p) && p.price <= budget)
  const by = c => [null, ...pool.filter(p => p.category === c).sort((a, b) => b.price - a.price).slice(0, 12)]
  const S = by('sneakers'), R = by('ropa'), A = by('accesorios')
  const combos = []
  for (const s of S) for (const r of R) for (const a of A) {
    const its = [s, r, a].filter(Boolean)
    if (its.length < 2) continue
    const total = its.reduce((t, p) => t + Number(p.price), 0)
    if (total <= budget) combos.push({ items: its, total })
  }
  combos.sort((x, y) => (y.total - x.total) || (y.items.length - x.items.length))
  const out = [], used = new Map()
  for (const c of combos) {
    if (c.items.some(p => (used.get(p.id) || 0) >= 1)) continue
    out.push(c); c.items.forEach(p => used.set(p.id, (used.get(p.id) || 0) + 1))
    if (out.length === 3) break
  }
  if (out.length < 3) for (const c of combos) { if (!out.includes(c)) out.push(c); if (out.length === 3) break }
  return out
}

/* ═══ Preguntas frecuentes (editá los textos acá) ═══ */
export const FAQ = [
  ['¿Los productos son originales?', 'Sí, el 100% de lo que vendemos es original e importado desde Estados Unidos. Cada pieza se revisa antes de publicarse. Si querés, te mandamos fotos o video extra del producto por WhatsApp antes de comprar.'],
  ['¿Cómo pago?', 'Podés pagar en dólares o en pesos al dólar blue venta del día (la cotización está arriba de todo en la web). Coordinamos el pago por WhatsApp: efectivo o transferencia.'],
  ['¿Hacen envíos?', 'Sí, hacemos envíos gratis a todo el país. Una vez confirmado el pago coordinamos el despacho y te pasamos el seguimiento. En CABA también se puede coordinar entrega en mano.'],
  ['¿Qué significa "Entrega inmediata" y "Pre-order"?', '"Entrega inmediata" es stock que ya tenemos en Argentina. "Pre-order" es un producto que traemos para vos: se reserva con una seña y el resto se abona cuando llega. El plazo estimado figura en cada producto.'],
  ['¿Cómo funcionan los encargos?', 'Si no encontrás lo que buscás en el stock, completá el formulario de Encargos con modelo, talle y color. Te respondemos por WhatsApp con precio final y plazo de llegada.'],
  ['¿Compran o aceptan cambios?', 'Sí, Buy · Sell · Trade. En la sección "Vendé / Cambiá" nos mandás los datos y fotos de tu prenda y te hacemos una oferta de compra o de cambio por algo de nuestro stock.'],
  ['¿Cómo sé mi talle en zapatillas?', 'En cada zapatilla mostramos el talle USA y su equivalente argentino (por ejemplo 10 US · 43 AR). Si tenés dudas, escribinos y te ayudamos a elegir.'],
]
