import { sql } from './_db.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT key, value FROM settings`
      const map = Object.fromEntries(rows.map(r => [r.key, r.value]))
      // Never expose the password hash/value publicly
      return res.status(200).json({ whatsapp: map.whatsapp || '5491165830511' })
    }

    if (req.method === 'PUT') {
      const { currentPassword, whatsapp, newPassword } = req.body

      const rows = await sql`SELECT value FROM settings WHERE key='password'`
      const stored = rows[0]?.value || 'klow2024'
      if (currentPassword !== stored) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' })
      }

      if (whatsapp) {
        await sql`
          INSERT INTO settings (key, value) VALUES ('whatsapp', ${whatsapp})
          ON CONFLICT (key) DO UPDATE SET value=${whatsapp}
        `
      }
      if (newPassword) {
        await sql`
          INSERT INTO settings (key, value) VALUES ('password', ${newPassword})
          ON CONFLICT (key) DO UPDATE SET value=${newPassword}
        `
      }
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', ['GET', 'PUT'])
    return res.status(405).json({ error: 'Método no permitido' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
