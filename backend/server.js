// ============================================================
// Snapvault Backend - Ana Sunucu
// ============================================================
// Bu dosya tüm API'yi içerir:
//  - Event oluşturma
//  - Event'e giriş (şifre doğrulama)
//  - Fotoğraf yükleme
//  - Event sahibi için fotoğraf listeleme
// ============================================================

const express = require('express');      // web sunucusu framework'ü
const { Pool } = require('pg');           // PostgreSQL bağlantısı
const multer = require('multer');         // dosya (fotoğraf) yükleme
const bcrypt = require('bcrypt');         // şifreleri güvenli hash'lemek için
const cors = require('cors');             // frontend'in API'ye erişebilmesi için
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Ayarlar ---
app.use(cors());                          // farklı porttan gelen istekleri kabul et
app.use(express.json());                  // JSON gövdeli istekleri çözümle
// Frontend artık ayrı bir nginx container'ında sunuluyor (bu satıra gerek yok)

// Fotoğrafların kaydedileceği local klasör (Aşama 2'de Azure Blob'a taşıyacağız)
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
app.use('/uploads', express.static(UPLOAD_DIR)); // yüklenen fotoları görüntülenebilir yap

// --- Veritabanı bağlantısı ---
// Bu bilgiler şimdilik kodda; Aşama 5'te Key Vault'tan gelecek
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'snapvault',
  password: process.env.DB_PASSWORD || 'localpassword123',
  database: process.env.DB_NAME || 'snapvault',
});

// --- Fotoğraf yükleme ayarı (multer) ---
// Fotoğrafı diske, benzersiz bir isimle kaydet
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname || '.jpg'));
  },
});
const upload = multer({ storage });

// ============================================================
// VERİTABANINI HAZIRLA (uygulama başlarken tabloları oluştur)
// ============================================================
async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('✅ Veritabanı hazır');
}

// ============================================================
// ENDPOINT 1: Event oluştur
// Event sahibi buraya event kodu + şifre + isim gönderir
// ============================================================
app.post('/api/events', async (req, res) => {
  try {
    const { eventCode, password, name } = req.body;
    if (!eventCode || !password) {
      return res.status(400).json({ error: 'Event kodu ve şifre gerekli' });
    }
    // Şifreyi asla düz metin saklamayız - hash'leriz
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO events (event_code, password_hash, name) VALUES ($1, $2, $3)',
      [eventCode, passwordHash, name || null]
    );
    res.json({ success: true, message: 'Event oluşturuldu', eventCode });
  } catch (err) {
    if (err.code === '23505') { // unique violation = bu kod zaten var
      return res.status(409).json({ error: 'Bu event kodu zaten kullanımda' });
    }
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// ============================================================
// Yardımcı: event kodu + şifre doğru mu? (event id döner)
// ============================================================
async function verifyEvent(eventCode, password) {
  const result = await pool.query(
    'SELECT id, password_hash FROM events WHERE event_code = $1',
    [eventCode]
  );
  if (result.rows.length === 0) return null;          // event yok
  const event = result.rows[0];
  const ok = await bcrypt.compare(password, event.password_hash);
  return ok ? event.id : null;                        // şifre yanlışsa null
}

// ============================================================
// ENDPOINT 2: Event'e giriş (şifre doğrula)
// Hem katılımcı hem sahip kullanır
// ============================================================
app.post('/api/events/login', async (req, res) => {
  try {
    const { eventCode, password } = req.body;
    const eventId = await verifyEvent(eventCode, password);
    if (!eventId) {
      return res.status(401).json({ error: 'Event kodu veya şifre yanlış' });
    }
    res.json({ success: true, eventId, eventCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// ============================================================
// ENDPOINT 3: Fotoğraf yükle
// Katılımcı kamera ile çekip buraya gönderir
// ============================================================
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  try {
    const { eventCode, password } = req.body;
    const eventId = await verifyEvent(eventCode, password);
    if (!eventId) {
      return res.status(401).json({ error: 'Event kodu veya şifre yanlış' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Fotoğraf gönderilmedi' });
    }
    // Fotoğrafın kaydını veritabanına yaz (dosyanın kendisi diskte)
    await pool.query(
      'INSERT INTO photos (event_id, file_path) VALUES ($1, $2)',
      [eventId, req.file.filename]
    );
    res.json({ success: true, message: 'Fotoğraf yüklendi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// ============================================================
// ENDPOINT 4: Event'in tüm fotoğraflarını listele
// Event sahibi galeriyi görmek için kullanır
// ============================================================
app.post('/api/photos/list', async (req, res) => {
  try {
    const { eventCode, password } = req.body;
    const eventId = await verifyEvent(eventCode, password);
    if (!eventId) {
      return res.status(401).json({ error: 'Event kodu veya şifre yanlış' });
    }
    const result = await pool.query(
      'SELECT file_path, uploaded_at FROM photos WHERE event_id = $1 ORDER BY uploaded_at DESC',
      [eventId]
    );
    // Her fotoğraf için görüntülenebilir URL döndür
    const photos = result.rows.map(r => ({
      url: '/uploads/' + r.file_path,
      uploadedAt: r.uploaded_at,
    }));
    res.json({ success: true, count: photos.length, photos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Sağlık kontrolü (Kubernetes Aşama 5'te kullanacak)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// --- Sunucuyu başlat ---
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Snapvault backend çalışıyor: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Veritabanı başlatılamadı:', err);
    process.exit(1);
  });
