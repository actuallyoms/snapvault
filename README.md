# 📸 Snapvault

Etkinliklerde herkesin çektiği fotoğrafları tek bir yerde toplayan web uygulaması.
Katılımcılar event no + şifre ile girip kameradan çeker, fotoğraflar otomatik yüklenir.
Event sahibi tüm fotoğrafları galeri olarak görür.

> Bu proje aynı zamanda bir **DevOps portföy projesidir**: Docker, Kubernetes,
> Terraform, CI/CD ve monitoring aşamalarıyla adım adım geliştirilmektedir.

## 🚧 Geliştirme Aşamaları

- [x] **Aşama 1** — Çalışan çekirdek (backend + web arayüzü + PostgreSQL, local)
- [ ] Aşama 2 — Azure Blob Storage entegrasyonu
- [ ] Aşama 3 — Docker container'lama
- [ ] Aşama 4 — Terraform ile altyapı (IaC)
- [ ] Aşama 5 — Kubernetes (AKS) + Key Vault deploy
- [ ] Aşama 6 — CI/CD (GitHub Actions)
- [ ] Aşama 7 — Monitoring (Prometheus + Grafana)

## 🛠 Teknolojiler (Aşama 1)

- **Backend:** Node.js + Express
- **Veritabanı:** PostgreSQL
- **Frontend:** Saf HTML/JS (tarayıcı kamerası — getUserMedia)
- **Şifreler:** bcrypt ile hash'lenir

## ▶️ Local'de Çalıştırma

### 1. PostgreSQL'i başlat (Docker ile)
```bash
docker compose up -d
```

### 2. Backend bağımlılıklarını kur ve çalıştır
```bash
cd backend
npm install
npm run dev
```

### 3. Tarayıcıda aç
```
http://localhost:3000
```

> ⚠️ **Kamera notu:** Tarayıcı kamerası yalnızca `localhost` veya HTTPS üzerinden
> çalışır. Local'de `localhost` sorunsuz çalışır.

## 📁 Proje Yapısı

```
snapvault/
├── docker-compose.yml      # PostgreSQL'i çalıştırır
├── backend/
│   ├── server.js           # Tüm API (event, auth, foto)
│   ├── schema.sql          # Veritabanı tabloları
│   └── package.json
└── frontend/
    └── index.html          # Tüm arayüz (kamera + galeri)
```

## 🔌 API Uç Noktaları

| Method | Yol | Açıklama |
|--------|-----|----------|
| POST | `/api/events` | Yeni event oluştur |
| POST | `/api/events/login` | Event'e giriş (şifre doğrula) |
| POST | `/api/photos` | Fotoğraf yükle |
| POST | `/api/photos/list` | Event'in tüm fotoğraflarını listele |
| GET | `/health` | Sağlık kontrolü |
