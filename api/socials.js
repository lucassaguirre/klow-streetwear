import { sql } from './_db.js'
import { randomUUID } from 'crypto'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM socials ORDER BY created_at DESC`
      const socials = rows.map(r => ({
        uid: r.uid,
        type: r.type,
        id: r.social_id,
        url: r.url,
      }))
      return res.status(200).json(socials)
    }

    if (req.method === 'POST') {
      const b = req.body
      const newUid = randomUUID()
      await sql`
        INSERT INTO socials (uid, type, social_id, url)
        VALUES (${newUid}, ${b.type}, ${b.id}, ${b.url})
      `
      return res.status(200).json({ ...b, uid: newUid })
    }

    if (req.method === 'DELETE') {
      const { uid } = req.query
      if (!uid) return res.status(400).json({ error: 'Falta el uid' })
      await sql`DELETE FROM socials WHERE uid=${uid}`
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
    return res.status(405).json({ error: 'Método no permitido' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
