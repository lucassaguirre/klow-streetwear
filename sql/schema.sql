-- Ejecutar UNA VEZ en el SQL Editor de tu base de datos (Railway o Supabase)

CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  brand       TEXT DEFAULT '',
  price       NUMERIC NOT NULL,
  sizes       TEXT DEFAULT '',
  stock       INTEGER DEFAULT 0,
  image       TEXT DEFAULT '',
  images      TEXT DEFAULT '[]',
  category    TEXT DEFAULT 'ropa',
  description TEXT DEFAULT '',
  created_at  TIMESTAMP DEFAULT now()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT DEFAULT '[]';

CREATE TABLE IF NOT EXISTS socials (
  uid        TEXT PRIMARY KEY,
  type       TEXT NOT NULL,
  social_id  TEXT NOT NULL,
  url        TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

INSERT INTO settings (key, value) VALUES
  ('whatsapp', '5491165830511'),
  ('password',  'klow2024')
ON CONFLICT (key) DO NOTHING;
