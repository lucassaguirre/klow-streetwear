import { sql } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Método no permitido' })
  }
  try {
    const { password } = req.body
    const rows = await sql`SELECT value FROM settings WHERE key='password'`
    const stored = rows[0]?.value || 'klow2024'
    return res.status(200).json({ ok: password === stored })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
