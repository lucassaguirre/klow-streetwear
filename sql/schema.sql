-- Ejecutar este script UNA VEZ en el SQL Editor de Neon
-- (Vercel → tu proyecto → Storage → tu base de datos → Open in Neon Console → SQL Editor)

CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  brand       TEXT DEFAULT '',
  price       NUMERIC NOT NULL,
  sizes       TEXT DEFAULT '',
  stock       INTEGER DEFAULT 0,
  image       TEXT DEFAULT '',
  category    TEXT DEFAULT 'ropa',
  description TEXT DEFAULT '',
  created_at  TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS socials (
  uid        TEXT PRIMARY KEY,
  type       TEXT NOT NULL,        -- 'tiktok' | 'instagram'
  social_id  TEXT NOT NULL,        -- el ID del video/reel
  url        TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- Valores iniciales (cambialos después desde el panel admin)
INSERT INTO settings (key, value) VALUES
  ('whatsapp', '5491165830511'),
  ('password', 'klow2024')
ON CONFLICT (key) DO NOTHING;
