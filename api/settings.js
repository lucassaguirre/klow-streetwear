import { sql } from './_db.js'

// Ajustes visibles para cualquiera (la contraseña NUNCA se expone)
const PUBLIC = ['whatsapp', 'vip_link', 'meta_pixel_id', 'ga_id', 'preorder_deposit']
const DEFAULTS = { whatsapp: '5491165830511', vip_link: '', meta_pixel_id: '', ga_id: '', preorder_deposit: '50' }

export async function getPublicSettings() {
  const rows = await sql`SELECT key, value FROM settings`
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]))
  return Object.fromEntries(PUBLIC.map(k => [k, map[k] ?? DEFAULTS[k]]))
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return res.status(200).json(await getPublicSettings())

    if (req.method === 'PUT') {
      const { currentPassword, newPassword, ...rest } = req.body || {}
      const rows = await sql`SELECT value FROM settings WHERE key='password'`
      const stored = rows[0]?.value || 'klow2024'
      if (currentPassword !== stored) return res.status(401).json({ error: 'Contraseña actual incorrecta' })
      for (const k of PUBLIC) {
        if (rest[k] === undefined) continue
        const v = String(rest[k]).trim()
        await sql`INSERT INTO settings(key,value) VALUES(${k},${v}) ON CONFLICT(key) DO UPDATE SET value=${v}`
      }
      if (newPassword) await sql`INSERT INTO settings(key,value) VALUES('password',${newPassword}) ON CONFLICT(key) DO UPDATE SET value=${newPassword}`
      return res.status(200).json({ ok: true })
    }
    res.setHeader('Allow', ['GET', 'PUT']); return res.status(405).json({ error: 'Método no permitido' })
  } catch (err) { console.error(err); return res.status(500).json({ error: err.message }) }
}
