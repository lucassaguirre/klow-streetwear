# KLOW Streetwear — v4

Web + API + base de datos en **Railway** (un solo servicio Node con Express).

## Estructura
- `server.js` → servidor: API, imágenes optimizadas (WebP), vistas previas para WhatsApp/Instagram, sitemap
- `api/` → endpoints (productos, videos, configuración, login)
- `src/lib.js` → utilidades, tabla de talles USA→ARG y **textos de Preguntas Frecuentes (FAQ)**
- `src/styles.js` → estilos
- `src/components/` → cabecera, pie, tarjetas, etc.
- `src/pages/` → una página por archivo (Home, Tienda, Producto, Encargos, Vendé, Vendidos, Armá tu look, FAQ, Admin)
- `sql/schema.sql` → tablas (se aplica sola al iniciar; agrega columnas nuevas sin borrar datos)

## Comandos
    npm run build   # compila el frontend
    npm start       # levanta el servidor
    npm run dev:api # API local en :3000 (con DATABASE_URL)
    npm run dev     # web local en :5173

## Variable en Railway (servicio web)
    DATABASE_URL = ${{Postgres.DATABASE_URL}}
