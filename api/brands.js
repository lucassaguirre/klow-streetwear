import { sql } from './_db.js'
import { cache } from './_lib.js'

const tidy = s => String(s || '').replace(/\s+/g, ' ').trim()

// Devuelve el nombre "oficial" de la marca (creándola si no existe)
export async function ensureBrand(name) {
  const n = tidy(name)
  if (!n) return ''
  const found = await sql`SELECT name FROM brands WHERE lower(name) = lower(${n})`
  if (found.length) return found[0].name
  await sql`INSERT INTO brands (name) VALUES (${n}) ON CONFLICT DO NOTHING`
  return n
}

// Al iniciar: carga en la tabla las marcas que ya usan los productos y unifica variantes
// ("nike", "NIKE ", "Nike" → la escritura más usada)
export async function backfillBrands() {
  const rows = await sql`SELECT brand, COUNT(*)::int AS n FROM products WHERE brand IS NOT NULL AND trim(brand) <> '' GROUP BY brand`
  const groups = new Map()
  for (const r of rows) {
    const k = tidy(r.brand).toLowerCase()
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k).push(r)
  }
  let fixed = 0
  for (const variants of groups.values()) {
    const existing = await sql`SELECT name FROM brands WHERE lower(name) = ${tidy(variants[0].brand).toLowerCase()}`
    // la más usada; si empatan, la que empieza con mayúscula y no está toda en mayúsculas ("Nike" > "NIKE" > "nike")
    const score = v => { const t = tidy(v.brand); return v.n * 10 + (/^\p{Lu}/u.test(t) ? 2 : 0) + (t !== t.toUpperCase() ? 1 : 0) }
    const canonical = existing[0]?.name || tidy(variants.sort((a, b) => score(b) - score(a))[0].brand)
    if (!existing.length) await sql`INSERT INTO brands (name) VALUES (${canonical}) ON CONFLICT DO NOTHING`
    for (const v of variants) if (v.brand !== canonical) { await sql`UPDATE products SET brand=${canonical} WHERE brand=${v.brand}`; fixed++ }
  }
  if (fixed) { cache.clear(); console.log(`✅ ${fixed} variante(s) de marca unificadas`) }
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT b.name, COUNT(p.id)::int AS count
        FROM brands b LEFT JOIN products p ON lower(p.brand) = lower(b.name)
        GROUP BY b.name ORDER BY lower(b.name)`
      return res.status(200).json(rows)
    }

    if (req.method === 'POST') {
      const name = await ensureBrand(req.body?.name)
      if (!name) return res.status(400).json({ error: 'Falta el nombre' })
      return res.status(200).json({ name })
    }

    // Renombrar: actualiza también todos los productos. Si el nuevo nombre ya existe, se fusionan.
    if (req.method === 'PUT') {
      const from = tidy(req.query.name), to = tidy(req.body?.name)
      if (!from || !to) return res.status(400).json({ error: 'Faltan datos' })
      const target = (await sql`SELECT name FROM brands WHERE lower(name)=lower(${to})`)[0]
      if (target && target.name.toLowerCase() !== from.toLowerCase()) {
        await sql`UPDATE products SET brand=${target.name} WHERE lower(brand)=lower(${from})`
        await sql`DELETE FROM brands WHERE lower(name)=lower(${from})`
      } else {
        await sql`UPDATE brands SET name=${to} WHERE lower(name)=lower(${from})`
        await sql`UPDATE products SET brand=${to} WHERE lower(brand)=lower(${from})`
      }
      cache.clear()
      return res.status(200).json({ name: target?.name || to })
    }

    if (req.method === 'DELETE') {
      const name = tidy(req.query.name)
      const used = (await sql`SELECT COUNT(*)::int AS n FROM products WHERE lower(brand)=lower(${name})`)[0].n
      if (used) return res.status(409).json({ error: `La usan ${used} producto(s). Cambiales la marca primero.` })
      await sql`DELETE FROM brands WHERE lower(name)=lower(${name})`
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    return res.status(405).json({ error: 'Método no permitido' })
  } catch (err) { console.error(err); return res.status(500).json({ error: err.message }) }
}
