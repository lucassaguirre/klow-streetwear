# KLOW Streetwear

Web + API + base de datos en **Railway** (un solo servicio Node con Express).

- `npm run build` → compila el frontend (Vite)
- `npm start` → levanta el servidor (sirve la web y la API `/api/*`)
- `npm run migrate` → copia los datos de Supabase a Railway

## Desarrollo local
    DATABASE_URL="postgresql://..."  npm run dev:api   # API en :3000
    npm run dev                                          # Web en :5173

## Variable en Railway (servicio web)
    DATABASE_URL = ${{Postgres.DATABASE_URL}}

Las tablas se crean solas al iniciar (sql/schema.sql).
Contraseña admin por defecto en una base nueva: klow2024
