-- Snapvault veritabanı şeması
-- Bu dosya uygulama ilk başladığında otomatik çalıştırılır (server.js içinden)

-- Event'leri tutan tablo
CREATE TABLE IF NOT EXISTS events (
  id            SERIAL PRIMARY KEY,           -- otomatik artan iç kimlik
  event_code    VARCHAR(20) UNIQUE NOT NULL,  -- katılımcıların gireceği event no (örn: "1234")
  password_hash TEXT NOT NULL,                -- şifre (asla düz metin değil, hash'lenmiş)
  name          VARCHAR(200),                 -- event adı (örn: "Ahmet'in Düğünü")
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Fotoğrafları tutan tablo
-- DİKKAT: fotoğrafın kendisi burada DEĞİL, storage'da. Burada sadece "kaydı" var.
CREATE TABLE IF NOT EXISTS photos (
  id          SERIAL PRIMARY KEY,
  event_id    INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE, -- hangi event'e ait
  file_path   TEXT NOT NULL,                  -- fotoğrafın storage'daki yolu/adı
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Sorguları hızlandırmak için index
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);
