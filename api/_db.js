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

function cleanConnectionString(str) {
  if (!str) return str
  try {
    const url = new URL(str)
    // Quitamos sslmode del connection string: lo manejamos nosotros
    // explícitamente vía la opción `ssl` de pg, para evitar el error
    // "self-signed certificate in certificate chain" con Supabase.
    url.searchParams.delete('sslmode')
    return url.toString()
  } catch {
    return str
  }
}

const pool = new Pool({
  connectionString: cleanConnectionString(connectionString),
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
