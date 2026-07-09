# ==================================================
# Stage 1: Build de la aplicación Angular SSR
# ==================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==================================================
# Stage 2: Imagen de producción con Nginx + Node.js
# ==================================================
FROM node:22-alpine

# Instalar nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Copiar archivos compilados desde builder
COPY --from=builder /app/dist/court-reservation-public ./
COPY --from=builder /app/package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Crear directorios necesarios
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx

# Variables de entorno
ENV PORT=4000
ENV NODE_ENV=production

# Exponer puertos (80 para nginx, 4000 para SSR)
EXPOSE 80 4000

# Script de inicio
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
