# ============================================================
# Snapvault Backend Dockerfile (sadece API)
# Frontend artık ayrı bir container'da (nginx), backend sadece API.
# ============================================================

FROM node:20-alpine
WORKDIR /app

# Bağımlılık dosyaları (cache optimizasyonu)
COPY package*.json ./
RUN npm install --production

# Backend kodu
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
