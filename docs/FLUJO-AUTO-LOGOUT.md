# Flujo de Auto-Logout por Expiración de Token

## Objetivo

Implementar un sistema de cierre de sesión automático que:
1. Detecte la expiración del token JWT
2. Muestre una notificación 5 minutos antes de la expiración
3. Cierre sesión automáticamente cuando el token expire

---

## Componentes Involucrados

| Componente | Tipo | Ubicación | Responsabilidad |
|------------|------|-----------|-----------------|
| `AlertBannerComponent` | Componente genérico | `src/app/shared/components/alert-banner/` | Banner reutilizable para cualquier notificación |
| `SessionWarningComponent` | Wrapper | `src/app/shared/components/session-warning/` | Usa AlertBanner para sesión |
| `SessionExpiryService` | Servicio | `src/app/core/services/` | Detectar expiración, emitir eventos |
| `AuthService` | Servicio | `src/app/core/auth/services/` | Integrar vigilancia, ejecutar logout |
| `NavVarComponent` | Componente | `src/app/shared/components/` | Contenedor del warning |

---

## Diagrama de Flujo

```
1. USUARIO HACE LOGIN
   │
   ▼
   AuthService.logIn(token)
   │
   ├──→ Guarda token en localStorage
   ├──→ Carga perfil de usuario
   └──→ SessionExpiryService.startWatching(token)
        │
        ├──→ Decodifica JWT (jwtDecode)
        ├──→ Obtiene fecha de expiración (exp)
        └──→ Inicia intervalo de verificación (30 segundos)

2. VERIFICACIÓN PERIÓDICA (cada 30 segundos)
   │
   ▼
   SessionExpiryService.checkExpiration()
   │
   ├──→ Calcula tiempo restante: exp - now
   │
   ├──→ Si tiempo > 5 minutos → No hace nada
   │
   ├──→ Si tiempo ≤ 5 minutos
   │    ├──→ showWarning = true (muestra notificación)
   │    └──→ Inicia countdown visual
   │
   └──→ Si tiempo ≤ 0 (expirado)
        ├──→ sessionExpired$.next()
        └──→ AuthService.logoutSession()

3. NOTIFICACIÓN VISIBLE (5 minutos antes)
   │
   ▼
   SessionWarningComponent aparece debajo del Nav
   │
   ├──→ Botón "Mantener sesión"
   │    └──→ AuthService.keepAlive() → Renueva token
   │
   └──→ Botón "Cerrar ahora"
        └──→ AuthService.logoutSession()

4. TOKEN EXPIRA (tiempo = 0)
   │
   ▼
   SessionExpiryService → sessionExpired$.next()
   │
   ▼
   AuthService.logoutSession()
   │
   ├──→ Limpia favoritos
   ├──→ Remueve token de localStorage
   ├──→ Limpia sessionStorage
   └──→ Navega a /auth/login
```

---

## Archivos a Crear/Modificar

### Archivos a Crear
| Archivo | Propósito |
|---------|-----------|
| `src/app/shared/components/alert-banner/alert-banner.component.ts` | Componente genérico reutilizable |
| `src/app/shared/components/alert-banner/alert-banner.component.css` | Estilos del componente genérico |
| `src/app/shared/components/session-warning/session-warning.component.ts` | Wrapper para sesión |
| `src/app/shared/components/session-warning/session-warning.component.html` | Template de sesión |
| `src/app/core/services/session-expiry.service.ts` | Servicio de vigilancia |

### Archivos a Modificar
| Archivo | Cambios |
|---------|---------|
| `src/app/core/auth/services/auth.service.ts` | Integrar SessionExpiryService |
| `src/app/shared/components/nav-var/nav-var.component.html` | Agregar `<app-session-warning>` |
| `src/styles.css` | Agregar estilos de alert-banner |

---

## Uso del AlertBannerComponent (Genérico)

### Tipos de banner disponibles
- `warning` → Amarillo (para advertencias)
- `error` → Rojo (para errores)
- `info` → Azul (para información)
- `success` → Verde (para éxitos)

### Ejemplos de uso

```html
<!-- Advertencia de sesión -->
<app-alert-banner
  [type]="'warning'"
  [icon]="'warning'"
  [visible]="showWarning"
  [actions]="[
    { label: 'Mantener sesión', action: 'extend' },
    { label: 'Cerrar ahora', action: 'logout' }
  ]"
  (actionClick)="onAction($event)">
  Tu sesión expira en 5 minutos
</app-alert-banner>

<!-- Error de conexión -->
<app-alert-banner
  [type]="'error'"
  [icon]="'wifi_off'"
  [visible]="!isConnected"
  [actions]="[{ label: 'Reintentar', action: 'retry' }]"
  (actionClick)="onRetry()">
  Sin conexión a internet
</app-alert-banner>

<!-- Éxito (auto-dismiss 3 segundos) -->
<app-alert-banner
  [type]="'success'"
  [icon]="'check_circle'"
  [visible]="showSuccess"
  [duration]="3000">
  Cambios guardados exitosamente
</app-alert-banner>
```

---

## Checklist de Implementación

- [ ] Crear documentación FLUJO-AUTO-LOGOUT.md
- [ ] Crear AlertBannerComponent (genérico)
- [ ] Crear SessionWarningComponent (wrapper)
- [ ] Crear SessionExpiryService
- [ ] Modificar AuthService (integrar servicio)
- [ ] Modificar NavVarComponent (agregar warning)
- [ ] Agregar estilos en styles.css
- [ ] Probar flujo completo
