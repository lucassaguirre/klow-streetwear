// Utilidades compartidas del backend
export function slugify(s = '') {
  return String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'producto'
}

export function parseImages(row) {
  let imgs = []
  try { imgs = row.images ? JSON.parse(row.images) : [] } catch { imgs = [] }
  if (!Array.isArray(imgs)) imgs = []
  if (!imgs.length && row.image) imgs = [row.image]
  return imgs
}

// Cache en memoria del listado (sin las fotos). Se invalida al escribir.
let listCache = null
export const cache = {
  get: () => listCache,
  set: v => { listCache = v },
  clear: () => { listCache = null },
}
