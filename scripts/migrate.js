// Copia productos, videos y configuración de Supabase a Railway.
// Uso:
//   SOURCE_DATABASE_URL="postgresql://...supabase..." \
//   TARGET_DATABASE_URL="postgresql://...railway (DATABASE_PUBLIC_URL)..." \
//   node scripts/migrate.js
import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = process.env.SOURCE_DATABASE_URL
const DST = process.env.TARGET_DATABASE_URL
if (!SRC || !DST) {
  console.error('Faltan SOURCE_DATABASE_URL y/o TARGET_DATABASE_URL')
  process.exit(1)
}

const clean = s => { try { const u = new URL(s); u.searchParams.delete('sslmode'); return u.toString() } catch { return s } }

// Intenta con SSL y si el servidor no lo soporta, sin SSL
async function connect(url, name) {
  for (const ssl of [{ rejectUnauthorized: false }, false]) {
    const c = new pg.Client({ connectionString: clean(url), ssl })
    try { await c.connect(); console.log(`✔ Conectado a ${name}${ssl ? ' (SSL)' : ''}`); return c }
    catch (e) { await c.end().catch(() => {}); if (ssl === false) throw new Error(`${name}: ${e.message}`) }
  }
}

const TABLES = {
  products: { cols: ['id', 'slug', 'name', 'brand', 'price', 'sizes', 'stock', 'image', 'images', 'category', 'description', 'availability', 'preorder_days', 'sold', 'views', 'created_at', 'updated_at'], key: 'id' },
  socials:  { cols: ['uid', 'type', 'social_id', 'url', 'created_at'], key: 'uid' },
  settings: { cols: ['key', 'value'], key: 'key' },
}

async function main() {
  const src = await connect(SRC, 'Supabase (origen)')
  const dst = await connect(DST, 'Railway (destino)')

  await dst.query(fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8'))
  console.log('✔ Tablas creadas en Railway\n')

  for (const [table, { cols, key }] of Object.entries(TABLES)) {
    let rows = []
    try { rows = (await src.query(`SELECT * FROM ${table}`)).rows }
    catch (e) { console.log(`⚠ ${table}: no existe en el origen, se saltea`); continue }

    let ok = 0
    for (const r of rows) {
      const present = cols.filter(c => r[c] !== undefined)
      const ph = present.map((_, i) => `$${i + 1}`).join(',')
      const upd = present.filter(c => c !== key).map(c => `${c}=EXCLUDED.${c}`).join(',')
      await dst.query(
        `INSERT INTO ${table} (${present.join(',')}) VALUES (${ph})
         ON CONFLICT (${key}) DO ${upd ? 'UPDATE SET ' + upd : 'NOTHING'}`,
        present.map(c => r[c])
      )
      ok++
    }
    console.log(`✔ ${table}: ${ok} fila(s) copiadas`)
  }

  const count = async t => (await dst.query(`SELECT COUNT(*)::int n FROM ${t}`)).rows[0].n
  console.log(`\n🎉 Listo. En Railway hay ${await count('products')} productos, ${await count('socials')} videos, ${await count('settings')} configuraciones.`)
  await src.end(); await dst.end()
}

main().catch(e => { console.error('\n❌ Error:', e.message); process.exit(1) })
