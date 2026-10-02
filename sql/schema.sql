-- Se ejecuta solo al iniciar el servidor. Es seguro correrlo muchas veces.

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

-- Columnas nuevas (v4)
ALTER TABLE products ADD COLUMN IF NOT EXISTS images        TEXT DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug          TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS availability  TEXT DEFAULT 'inmediata';
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_days TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS sold          BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS views         INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMP DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products (slug);

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
  ('password', 'klow2024'),
  ('vip_link', ''),
  ('meta_pixel_id', ''),
  ('ga_id', ''),
  ('preorder_deposit', '50')
ON CONFLICT (key) DO NOTHING;
