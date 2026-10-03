import { sql } from './_db.js'
import { randomUUID } from 'crypto'

// Listado liviano (sin la imagen en base64)
let listCache = null
export async function listTestimonials() {
  if (listCache) return listCache
  const rows = await sql`SELECT id, caption, position, created_at FROM testimonials ORDER BY position ASC, created_at DESC`
  listCache = rows.map(r => ({ id: r.id, caption: r.caption || '', position: r.position, image: `/timg/${r.id}?v=${new Date(r.created_at).getTime()}` }))
  return listCache
}

export async function getTestimonialImage(id) {
  const r = (await sql`SELECT image FROM testimonials WHERE id=${id}`)[0]
  return r?.image || null
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return res.status(200).json(await listTestimonials())

    // Alta: { image: dataURL, caption }
    if (req.method === 'POST') {
      const { image, caption = '' } = req.body || {}
      if (typeof image !== 'string' || !image.startsWith('data:image/')) return res.status(400).json({ error: 'Falta la imagen' })
      const id = randomUUID()
      // las nuevas van primero
      await sql`UPDATE testimonials SET position = position + 1`
      await sql`INSERT INTO testimonials (id, image, caption, position) VALUES (${id}, ${image}, ${String(caption).slice(0, 200)}, 0)`
      listCache = null
      return res.status(200).json((await listTestimonials()).find(t => t.id === id))
    }

    // Editar texto o reordenar: ?id=  { caption }  ó  { order: [id, id, ...] }
    if (req.method === 'PUT') {
      if (Array.isArray(req.body?.order)) {
        let pos = 0
        for (const id of req.body.order) await sql`UPDATE testimonials SET position=${pos++} WHERE id=${id}`
      } else {
        const { id } = req.query; if (!id) return res.status(400).json({ error: 'Falta id' })
        await sql`UPDATE testimonials SET caption=${String(req.body?.caption || '').slice(0, 200)} WHERE id=${id}`
      }
      listCache = null
      return res.status(200).json(await listTestimonials())
    }

    if (req.method === 'DELETE') {
      const { id } = req.query; if (!id) return res.status(400).json({ error: 'Falta id' })
      await sql`DELETE FROM testimonials WHERE id=${id}`
      listCache = null
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    return res.status(405).json({ error: 'Método no permitido' })
  } catch (err) { console.error(err); return res.status(500).json({ error: err.message }) }
}
