# KLOW Streetwear

Landing + tienda con panel de administración. Productos, fotos, stock, precio
en USD/dólar blue, y videos de TikTok/Instagram se guardan en una base de
datos Postgres (Neon), así que cualquier visitante ve lo mismo sin importar
desde qué dispositivo entre.

## 1. Subir a GitHub

Subí toda esta carpeta (incluyendo `api/`, `src/`, `public/`, `sql/`) a un
repositorio nuevo en GitHub.

## 2. Importar en Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → importá el repo.
2. Vercel detecta Vite automáticamente. Hacé clic en **Deploy** (va a fallar
   la primera vez porque falta la base de datos — es normal, seguí al paso 3).

## 3. Crear la base de datos (Supabase, gratis)

1. Dentro de tu proyecto en Vercel → pestaña **Storage** → **Create Database**.
2. Elegí **Supabase** → plan **Free** → seguí los pasos (Términos → Configuración
   → Confirmación) y hacé clic en **Create**. No hace falta cambiar nada de
   lo que viene por defecto.
3. Vercel va a inyectar automáticamente las variables `POSTGRES_URL`,
   `POSTGRES_URL_NON_POOLING`, etc. en tu proyecto.

## 4. Crear las tablas

1. En la pestaña **Storage**, abrí tu base → **Open in Supabase**.
2. Andá a **SQL Editor** → **New query**.
3. Pegá y ejecutá el contenido del archivo [`sql/schema.sql`](./sql/schema.sql).

Esto crea las tablas `products`, `socials` y `settings`, y carga los valores
iniciales:
- WhatsApp: `5491165830511`
- Contraseña de admin: `klow2024`

## 5. Redeploy

Volvé a Vercel → **Deployments** → en el último deploy, los tres puntitos →
**Redeploy**. Ahora sí va a levantar correctamente.

## 6. Listo

- Tu web va a estar en `https://tu-proyecto.vercel.app`
- Entrá a **Admin** (arriba a la derecha) con la contraseña `klow2024`
- Cargá productos con imágenes desde tu PC, configurá tu WhatsApp y
  cambiá la contraseña desde **⚙ Config**

## Notas

- Las imágenes se comprimen automáticamente y se guardan como base64 en la
  base de datos (no hace falta un servicio aparte de imágenes).
- Los reels de TikTok se ven embebidos directo. Los de Instagram requieren
  que la página esté en un dominio público (no funcionan en `localhost` ni
  en vistas previas en sandbox).
- El plan gratis de Neon alcanza sobradamente para un catálogo de varios
  cientos de productos con fotos.
