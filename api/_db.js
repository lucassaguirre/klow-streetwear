import pg from 'pg'

const { Pool } = pg

// La integración de Supabase en Vercel inyecta POSTGRES_URL (y variantes).
// Probamos en orden de preferencia (la versión "non pooling" es ideal para
// funciones serverless de corta duración).
const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL

if (!connectionString) {
  console.warn('⚠️  No se encontró la variable de conexión a Postgres. Conectá la integración de Supabase en Vercel → Storage.')
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

// Helper con la misma firma "tagged template" que usan los endpoints,
// para no tener que reescribir las queries.
export async function sql(strings, ...values) {
  let text = ''
  strings.forEach((chunk, i) => {
    text += chunk
    if (i < values.length) text += `$${i + 1}`
  })
  const { rows } = await pool.query(text, values)
  return rows
}
