# ==================================================
# Stage 1: Build de la aplicación Angular SSR
# ==================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluye devDependencies necesarias para el build)
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Build SSR (genera dist/court-reservation-public con browser + server)
RUN npm run build

# ==================================================
# Stage 2: Imagen de producción (solo runtime)
# ==================================================
FROM node:22-alpine

WORKDIR /app

# Copiar solo los archivos compilados necesarios desde el builder
COPY --from=builder /app/dist/court-reservation-public ./
COPY --from=builder /app/package*.json ./

# Instalar SOLO dependencias de producción (no devDependencies)
RUN npm ci --only=production

# Variables de entorno
ENV PORT=4000
ENV NODE_ENV=production

# Exponer puerto del servidor SSR
EXPOSE 4000

# Usar usuario no-root para seguridad
USER node

# Comando para ejecutar el servidor SSR
CMD ["node", "dist/court-reservation-public/server/server.mjs"]
