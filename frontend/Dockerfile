# ============================================================
# Snapvault Frontend Dockerfile (Multi-Stage)
# ============================================================
# Senin frontend'in basit (tek HTML), build gerektirmiyor.
# Ama multi-stage mantığını göstermek için iki aşamalı yazıyoruz.
# React/Vue olsaydı, AŞAMA 1'de "npm run build" çalışırdı.
# ============================================================

# ===== AŞAMA 1: BUILD (hazırlık aşaması) =====
# Burada normalde frontend build edilir (React/Vue için npm run build).
# Senin durumunda sadece dosyaları hazırlıyoruz.
FROM node:20-alpine AS builder
WORKDIR /build
# Frontend dosyalarını kopyala
COPY . .
# (React olsaydı burada şunlar olurdu:)
#   RUN npm install
#   RUN npm run build   -> /build/dist içinde statik dosyalar oluşurdu
# Bizim durumda index.html zaten hazır, build gerekmiyor.

# ===== AŞAMA 2: SERVE (sunum aşaması) =====
# Temiz, küçük bir nginx image'ı. Node, npm YOK - sadece nginx.
FROM nginx:alpine

# Nginx yapılandırmasını kopyala (API yönlendirmesi için)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# AŞAMA 1'den statik dosyaları al, nginx'in sunduğu klasöre koy
# (index.html'i builder aşamasından kopyalıyoruz)
COPY --from=builder /build/index.html /usr/share/nginx/html/

# Nginx 80 portunu dinler
EXPOSE 80

# nginx otomatik başlar, CMD'ye gerek yok
