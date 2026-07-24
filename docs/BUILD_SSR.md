# Ejecutar la aplicación con SSR (Server-Side Rendering)

## 🎯 Configuración SSR Implementada

### Cambios Realizados para SSR

1. **Angular Budgets Ajustados** ([angular.json:54-56](angular.json#L54-L56))
   - `anyComponentStyle` maximumWarning: 10kB
   - `anyComponentStyle` maximumError: 25kB
   - Permite componentes con CSS extenso como landing pages

2. **Modo de Renderizado** ([app.routes.server.ts](src/app/app.routes.server.ts))
   - Cambiado de `RenderMode.Prerender` a `RenderMode.Server`
   - Todas las rutas (`**`) se renderizan en servidor
   - Evita errores de prerendering con código específico del navegador

3. **Leaflet SSR Compatible** ([tab-ubicacion.component.ts](src/app/features/canchas/components/tab-ubicacion/tab-ubicacion.component.ts))
   - Importación dinámica: `const L = await import('leaflet')`
   - Detección de plataforma: `isPlatformBrowser(this.platformId)`
   - Solo se ejecuta en el navegador, no en SSR

4. **Tailwind v4 Syntax** ([tab-ubicacion.component.css](src/app/features/canchas/components/tab-ubicacion/tab-ubicacion.component.css))
   - `bg-opacity-50` → `bg-black/50`
   - Nueva sintaxis de opacidad inline

---

## 🚀 Pasos para ejecutar con SSR localmente:

### 1. Build de la aplicación
```bash
npm run build
```

Este comando:
- Compila la aplicación para producción
- Genera archivos en `dist/court-reservation-admin/`
- Incluye tanto el cliente (browser) como el servidor (server)
- **Tiempo estimado**: ~40 segundos

### 2. Ejecutar el servidor SSR
```bash
npm run serve:ssr:court-reservation-admin
```

Este comando:
- Inicia el servidor Node.js/Express
- Ejecuta en `http://localhost:4000` (puerto por defecto)
- Renderiza las páginas en el servidor antes de enviarlas al navegador
- Mensaje de éxito: `Node Express server listening on http://localhost:4000`

### 3. Abrir en el navegador
```
http://localhost:4000
```

---

## ✅ Verificación de SSR

### Comprobaciones de éxito:
- ✅ Build completa sin errores (solo warnings)
- ✅ Carpeta `dist/court-reservation-admin/server/` generada
- ✅ Archivo `server.mjs` existe
- ✅ Servidor escuchando en puerto 4000
- ✅ Rutas funcionan sin 404 en refresh (ej: `/admin/canchas/editar/2`)
- ✅ No más error `window is not defined`

### Warnings esperados (no críticos):
- Budget warnings para `home.component.css` (18.41kB)
- Budget warnings para `dashboard-proveedor.component.css` (13.00kB)
- Bundle inicial excede 500kB (698.19kB - incluye Material + Leaflet)
- Módulos CommonJS: `object-path`, `leaflet`

---

## 📚 Arquitectura SSR

```
┌─────────────────────────────────────┐
│  Client Request (Browser)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Express Server (Node.js)           │
│  - server.mjs                       │
│  - AngularNodeAppEngine             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Angular SSR Rendering              │
│  - RenderMode.Server                │
│  - Platform detection               │
│  - Dynamic imports for browser libs │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  HTML Response + Hydration          │
│  - Prerendered HTML                 │
│  - Client-side hydration            │
└─────────────────────────────────────┘
```

---

## 🔄 Diferencias: Development vs SSR

| Aspecto | `ng serve` (Dev) | SSR (`npm run build` + serve) |
|---------|------------------|-------------------------------|
| Puerto | 4200 | 4000 |
| Renderizado | Solo cliente | Servidor + Cliente |
| Refresh en rutas | 404 error | ✅ Funciona |
| `window` detection | No necesario | ✅ Requerido |
| Build time | N/A | ~40 segundos |
| Hot reload | ✅ Sí | ❌ No (rebuild required) |

---

## ⚠️ Notas importantes:

- **Puerto**: Por defecto usa el puerto 4000 (no 4200 como ng serve)
- **Hot Reload**: NO hay auto-reload. Si cambias código, debes:
  1. Detener el servidor (Ctrl+C)
  2. Ejecutar `npm run build` de nuevo
  3. Ejecutar `npm run serve:ssr:court-reservation-admin`

---

## 💻 Para desarrollo normal (sin SSR):
```bash
npm start
# o
ng serve
```

---

## 🛠️ Troubleshooting

### Error: "window is not defined"
**Solución**: Usar `isPlatformBrowser()` y dynamic imports
```typescript
if (!isPlatformBrowser(this.platformId)) return;
const L = await import('leaflet');
```

### Error: "Cannot find module server.mjs"
**Solución**: Ejecutar `npm run build` primero

### Error: CSS budget exceeded
**Solución**: Ajustar budgets en `angular.json` o optimizar CSS

### Rutas devuelven 404 en refresh
**Solución**: Usar `RenderMode.Server` en lugar de `RenderMode.Prerender`

### Build falla con prerendering
**Solución**: Cambiar a `RenderMode.Server` en `app.routes.server.ts`

---

## 📝 Resumen de Soluciones Implementadas

| Problema | Solución Implementada | Archivo |
|----------|----------------------|---------|
| `window is not defined` | Dynamic imports + `isPlatformBrowser()` | `tab-ubicacion.component.ts` |
| 404 en refresh de rutas | `RenderMode.Server` para todas las rutas | `app.routes.server.ts` |
| CSS budget exceeded | Aumentar límite a 25kB | `angular.json` |
| Tailwind v4 incompatibilidad | `bg-black/50` en lugar de `bg-opacity-50` | `tab-ubicacion.component.css` |
| Leaflet no SSR-safe | Importación dinámica en métodos async | `tab-ubicacion.component.ts` |

---

## 🐳 Despliegue en Producción con Docker

### ⚠️ Importante: SSR requiere Node.js, no solo archivos estáticos

**Diferencia clave**:
```
❌ SPA tradicional (Sin SSR):
   Docker → Nginx → dist/browser/ (solo archivos estáticos)
   Resultado: 404 en refresh, sin SEO

✅ SSR con Node.js:
   Docker → Node.js → server.mjs (renderiza en servidor)
   Resultado: ✅ Rutas funcionan, ✅ SEO optimizado
```

### 📦 Dockerfile para SSR

Crea un archivo `Dockerfile` en la raíz del proyecto:

```dockerfile
# Stage 1: Build de la aplicación
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluye devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Build SSR (genera dist/court-reservation-admin con browser + server)
RUN npm run build

# Stage 2: Imagen de producción
FROM node:22-alpine

WORKDIR /app

# Copiar solo los archivos necesarios desde el builder
COPY --from=builder /app/dist/court-reservation-admin ./
COPY --from=builder /app/package*.json ./

# Instalar SOLO dependencias de producción
RUN npm ci --only=production

# Variables de entorno
ENV PORT=4000
ENV NODE_ENV=production

# Exponer puerto
EXPOSE 4000

# Usuario no-root para seguridad
USER node

# Comando para ejecutar servidor SSR
CMD ["node", "server/server.mjs"]
```

### 🚀 Comandos Docker

```bash
# 1. Build de la imagen Docker
docker build -t reserva-canchas-admin:latest .

# 2. Ejecutar contenedor
docker run -p 4000:4000 reserva-canchas-admin:latest

# 3. Verificar
# Abrir http://localhost:4000
```

### 🔧 docker-compose.yml (Opcional)

```yaml
version: '3.8'

services:
  admin-web:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:4000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 📊 Comparación: Nginx vs Node.js

| Aspecto | Nginx (Sin SSR) | Node.js (Con SSR) |
|---------|----------------|-------------------|
| Archivos servidos | `dist/browser/` | `dist/court-reservation-admin/` |
| Renderizado | Solo cliente | Servidor + Cliente |
| SEO | ❌ Limitado | ✅ Completo |
| Refresh en rutas | ❌ 404 error | ✅ Funciona |
| Requisitos | Nginx | Node.js 22+ |
| Tamaño imagen | ~50MB | ~150MB |
| Performance | Muy rápido (estático) | Rápido (renderizado dinámico) |

### ⚙️ Variables de Entorno en Producción

Para que funcione correctamente en producción, asegúrate de que `environment.prod.ts` apunte a tu backend:

```typescript
export const environment = {
  production: true,
  backend: {
    baseApiUrl: 'https://tu-backend-api.com/api'  // URL de producción
  },
  maps: {
    defaultLat: -12.046374,
    defaultLng: -77.042793,
    // ...
  }
};
```

### 🔒 Consideraciones de Seguridad

1. **Puerto en producción**: Cambia `PORT=4000` si es necesario
2. **HTTPS**: Usa un reverse proxy (Nginx/Traefik) con SSL delante de Node.js
3. **Health checks**: Implementa endpoint `/health` para monitoreo
4. **Logs**: Configura logging apropiado para producción

### 📈 Arquitectura Recomendada en Producción

```
Internet
   │
   ▼
┌────────────────────────────┐
│  Nginx/Traefik (HTTPS)     │ ← Reverse Proxy + SSL
│  - Certificados SSL        │
│  - Rate limiting           │
│  - Compresión Gzip         │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  Docker: Node.js SSR       │ ← Tu aplicación Angular
│  - Puerto 4000             │
│  - server.mjs              │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  Backend API (.NET)        │
│  - Puerto 9090             │
└────────────────────────────┘
```

### ✅ Checklist Pre-Deploy

- [ ] `npm run build` completa sin errores
- [ ] Variables de entorno configuradas en `environment.prod.ts`
- [ ] Dockerfile creado y testeado localmente
- [ ] Health check funcionando
- [ ] SSL/HTTPS configurado (en producción)
- [ ] Logs configurados
- [ ] Monitoreo configurado (opcional: PM2, Docker healthcheck)
