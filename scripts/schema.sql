-- neredenyiyelim venues table
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  il TEXT NOT NULL,
  ad TEXT NOT NULL,
  kategori TEXT,
  puan NUMERIC,
  yorum_sayisi INTEGER,
  fiyat TEXT,
  trend BOOLEAN NOT NULL DEFAULT FALSE,
  michelin BOOLEAN NOT NULL DEFAULT FALSE,
  yildiz INTEGER,
  bib_gourmand BOOLEAN NOT NULL DEFAULT FALSE,
  michelin_mention BOOLEAN NOT NULL DEFAULT FALSE,
  adres TEXT,
  lat NUMERIC,
  lng NUMERIC,
  calisma_saatleri TEXT,
  rezervasyon TEXT,
  gorsel TEXT,
  galeri JSONB NOT NULL DEFAULT '[]',
  ozellikler JSONB NOT NULL DEFAULT '[]',
  alinti TEXT,
  neden TEXT,
  menu JSONB NOT NULL DEFAULT '[]',
  yorumlar JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_venues_il ON venues (il);
