import { sql } from './_db.js'
import { randomUUID } from 'crypto'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM products ORDER BY created_at DESC`
      const products = rows.map(r => ({
        id: r.id,
        name: r.name,
        brand: r.brand || '',
        price: r.price,
        sizes: r.sizes || '',
        stock: String(r.stock),
        image: r.image || '',
        category: r.category,
        description: r.description || '',
      }))
      return res.status(200).json(products)
    }

    if (req.method === 'POST') {
      const b = req.body
      const id = randomUUID()
      await sql`
        INSERT INTO products (id, name, brand, price, sizes, stock, image, category, description)
        VALUES (${id}, ${b.name}, ${b.brand || ''}, ${b.price}, ${b.sizes || ''}, ${b.stock || 0}, ${b.image || ''}, ${b.category || 'ropa'}, ${b.description || ''})
      `
      return res.status(200).json({ ...b, id })
    }

    if (req.method === 'PUT') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'Falta el id' })
      const b = req.body
      await sql`
        UPDATE products
        SET name=${b.name}, brand=${b.brand || ''}, price=${b.price}, sizes=${b.sizes || ''},
            stock=${b.stock || 0}, image=${b.image || ''}, category=${b.category || 'ropa'}, description=${b.description || ''}
        WHERE id=${id}
      `
      return res.status(200).json({ ...b, id })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'Falta el id' })
      await sql`DELETE FROM products WHERE id=${id}`
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    return res.status(405).json({ error: 'Método no permitido' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
