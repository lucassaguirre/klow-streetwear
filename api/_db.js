import pg from 'pg'
const { Pool } = pg

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL

if (!connectionString) {
  console.warn('⚠️  Falta DATABASE_URL. En Railway: servicio web → Variables → DATABASE_URL = ${{Postgres.DATABASE_URL}}')
}

function cleanUrl(str) {
  if (!str) return str
  try { const u = new URL(str); u.searchParams.delete('sslmode'); return u.toString() } catch { return str }
}

// Railway red interna (*.railway.internal) y localhost NO usan SSL.
// Cualquier otro host (proxy público, Supabase, etc.) usa SSL.
// Se puede forzar con DB_SSL=true / DB_SSL=false
function sslFor(str) {
  if (process.env.DB_SSL === 'false') return false
  if (process.env.DB_SSL === 'true') return { rejectUnauthorized: false }
  try {
    const host = new URL(str).hostname
    if (host.endsWith('.railway.internal') || host === 'localhost' || host === '127.0.0.1') return false
  } catch {}
  return { rejectUnauthorized: false }
}

export const pool = new Pool({
  connectionString: cleanUrl(connectionString),
  ssl: sslFor(connectionString || ''),
  max: 5,
})

export async function sql(strings, ...values) {
  let text = ''
  strings.forEach((chunk, i) => { text += chunk; if (i < values.length) text += `$${i + 1}` })
  const { rows } = await pool.query(text, values)
  return rows
}
