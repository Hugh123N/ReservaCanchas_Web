# Vigilancia, renovación y cierre de sesión

## Responsabilidades

| Elemento | Responsabilidad |
|----------|-----------------|
| `AppComponent` | Inicializa la sesión, contiene el aviso global y cierra diálogos al terminar la sesión |
| `AuthService` | Restaura, renueva y limpia la sesión; sincroniza otras pestañas |
| `SessionExpiryService` | Calcula tiempo absoluto, muestra aviso a cinco minutos y emite expiración |
| `session-token.utils.ts` | Decodifica claims, normaliza negocio/roles y rechaza JWT vencido o inválido |
| `SessionWarningComponent` | Acciones "Mantener sesión" y "Cerrar ahora", progreso y error recuperable |
| `tokenInterceptor` / `AuthGuard` | Rechazan credenciales vencidas y dirigen al login cuando corresponde |

El aviso vive en `app.component.html`, fuera del router outlet, para estar disponible también en reservas, pago y mapa.

## Flujo

1. Al arrancar, `initializeSession()` registra listeners una sola vez y comprueba el token guardado. Un JWT válido restaura perfil y vigilancia; uno inválido se limpia y redirige al login.
2. Login guarda un token válido e inicia la misma vigilancia. El intervalo único comprueba cada segundo fuera de Angular; actualiza signals solo al cambiar minutos/aviso.
3. Al quedar cinco minutos aparece el aviso. No hay renovación automática por actividad ni por mostrar el aviso.
4. "Mantener sesión" suscribe `keepAlive()`. Se comparte una única petición a `GET /Usuario/renew-session`, con timeout de 15 segundos, conservando la vigilancia del token original.
5. La respuesta solo se acepta si la sesión original sigue vigente y coincide con la almacenada, y el token nuevo conserva identidad/negocio y extiende `exp`.
6. Una renovación exitosa actualiza localStorage y reinicia la vigilancia. Un error recuperable conserva el aviso y permite reintentar. La petición usa `SKIP_LOADING` para mantener accesible el botón de cierre.
7. Expiración, "Cerrar ahora" o un 401 autenticado ejecutan el mismo cierre inmediato e idempotente: cancelar renovación, detener reloj, eliminar token/sessionStorage, vaciar perfil, cerrar diálogos, limpiar favoritos y navegar a `/auth/login`.
8. `storage` adopta renovaciones y cierres de otras pestañas; `focus` y `visibilitychange` comprueban el reloj tras suspensión. Las respuestas tardías de tokens anteriores no reemplazan ni cierran la sesión actual.

## Contrato con API

- La API verifica firma y autorización. La decodificación del frontend solo controla su estado local.
- La renovación conserva `UserIdNegocio` del principal autenticado; `ApplicationCode` se incluye en tokens nuevos y se conserva al renovar.
- La lectura de negocio admite claims vacíos sin lanzar errores de conversión.
- El cierre es local: los métodos simulados de logout de `UsersService` no revocan un JWT en servidor.
- En SSR no se accede a storage ni se programan timers; la sesión se restaura en navegador.

## Verificación

Desde la raíz de cada frontend:

```bash
npm exec ng test -- --watch=false --browsers=ChromeHeadless --include="src/app/core/auth/services/*.spec.ts" --include="src/app/app.component.spec.ts"
```

Las pruebas cubren restauración, JWT inválidos/vencidos, aviso y cierre por reloj, renovación concurrente, reintento, timeout, respuestas inconsistentes, ambos botones, cancelación HTTP, 401 antiguos, guard, aviso global, cierre de diálogos y sincronización entre pestañas.
