import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { pool } from './api/_db.js'
import products from './api/products.js'
import socials from './api/socials.js'
import settings from './api/settings.js'
import login from './api/login.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.disable('x-powered-by')
app.use(express.json({ limit: '25mb' })) // fotos en base64

// ── API ──
app.all('/api/products', products)
app.all('/api/socials', socials)
app.all('/api/settings', settings)
app.all('/api/login', login)
app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'up' }) }
  catch (e) { res.status(500).json({ ok: false, db: 'down', error: e.message }) }
})
app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))

// ── Frontend (build de Vite) ──
const dist = path.join(__dirname, 'dist')
app.use(express.static(dist, {
  index: false,
  setHeaders: (res, file) => {
    if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  },
}))
// Cualquier otra ruta (/producto/:id, /admin, ...) → React Router
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))

// ── Crea las tablas si no existen (base nueva = funciona sola) ──
async function initDb() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8')
    await pool.query(schema)
    console.log('✅ Base de datos lista')
  } catch (e) {
    console.error('❌ No se pudo inicializar la base:', e.message)
  }
}

initDb().finally(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 KLOW corriendo en el puerto ${PORT}`))
})
