import pg from 'pg'
const { Pool } = pg

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL

if (!connectionString) {
  console.warn('⚠️  No se encontró DATABASE_URL. Configurá la base de datos en Vercel → Settings → Environment Variables.')
}

function cleanConnectionString(str) {
  if (!str) return str
  try {
    const url = new URL(str)
    url.searchParams.delete('sslmode')
    return url.toString()
  } catch { return str }
}

const pool = new Pool({
  connectionString: cleanConnectionString(connectionString),
  ssl: { rejectUnauthorized: false },
})

export async function sql(strings, ...values) {
  let text = ''
  strings.forEach((chunk, i) => {
    text += chunk
    if (i < values.length) text += `$${i + 1}`
  })
  const { rows } = await pool.query(text, values)
  return rows
}
