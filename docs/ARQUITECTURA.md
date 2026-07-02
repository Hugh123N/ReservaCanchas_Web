# Arquitectura Técnica - ReservaCanchas Web

## 1. Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Angular | 20.3.6 | Framework principal (standalone components, signals) |
| Angular SSR | 20.3.6 | Server-Side Rendering para SEO |
| Angular Material | 20.2.9 | Componentes UI (dialogs, snackbars, menus, etc.) |
| Tailwind CSS | 4.1.12 | Utilidades de estilos |
| Mapbox GL JS | 3.16.0 | Mapas interactivos y geolocalización |
| SweetAlert2 | 11.6.13 | Alertas y modales de confirmación |
| @ngx-translate | 16.0.4 | Internacionalización (i18n) |
| ngx-permissions | 19.0.0 | Control de acceso basado en permisos |
| ngx-ui-loader | 19.0.0 | Loading global |
| jwt-decode | 4.0.0 | Decodificación de tokens JWT |
| Express | 4.18.2 | Servidor HTTP para SSR |
| Node.js | 22 | Runtime del servidor |
| Docker | Multi-stage | Despliegue en contenedores |

---

## 2. Estructura del Proyecto

```
src/app/
├── base/                    # Capa de infraestructura base
│   ├── components/          # Componentes abstractos
│   │   ├── base-component/
│   │   └── base-search-component/
│   ├── containers/          # Navegación (sidebar)
│   ├── models/              # Modelos API y paginación
│   │   ├── api/             # ResponseBaseDto, ApplicationMessage
│   │   ├── grid/            # SearchParamsModel, SearchResultModel
│   │   └── query/           # QueryParamsModel, QueryResultsModel
│   ├── pages/               # Páginas de error (401, 404, 500)
│   └── services/            # BaseService (clase HTTP base)
│
├── core/                    # Capa central de la aplicación
│   ├── auth/                # Autenticación y autorización
│   │   ├── guards/          # AuthGuard (CanActivateFn)
│   │   ├── interceptor/     # Token interceptor (funcional)
│   │   └── services/        # AuthService (JWT, sesiones)
│   ├── config/              # Configuración y permisos
│   │   ├── locale.config.ts
│   │   └── permissions/
│   ├── constants/           # Constantes de negocio
│   │   └── constants.constant.ts (ESTADO_CANCHA, TIPO_CANCHA)
│   ├── interceptors/        # Interceptores HTTP
│   │   ├── loading.interceptor.ts
│   │   └── language-interceptor.ts (inactivo)
│   └── services/            # Servicios core
│       ├── config.service.ts (APP_INITIALIZER)
│       ├── loading.service.ts (signals)
│       ├── mapbox.service.ts
│       ├── geolocation.service.ts
│       ├── responsive.service.ts
│       └── translation.service.ts
│
├── shared/                  # Elementos compartidos
│   ├── components/          # Footer, FormError, NavVar, SearchBar
│   ├── enums/               # EstadoPago, EstadoReserva
│   ├── interfaces/          # UbicacionCancha, LimitesMapa, etc.
│   ├── model/               # PAGES_ROUTE
│   ├── types/               # IColumnDef, IActions, TypedFormGroup
│   ├── utils/               # date.utils, form.utils, horario.utils
│   └── validators/          # passwordMatchValidator
│
├── features/                # Módulos de negocio
│   ├── auth/                # Login, registro, OAuth, forgot/reset
│   ├── canchas/             # Búsqueda, detalle, mapa, favoritos
│   ├── reserva/             # Modelos y servicios de reserva
│   ├── pago/                # Confirmación de reserva/pago
│   ├── mis-reservas/        # Listado de reservas del usuario
│   ├── user-profile/        # Perfil de usuario
│   ├── home/                # Landing page
│   ├── cancha-estado/       # Catálogo de estados de cancha
│   ├── cancha-tipo/         # Catálogo de tipos de deporte
│   └── entity/              # Entidades compartidas (horarios, días)
│
├── app.routes.ts            # Rutas principales
├── app.routes.server.ts     # Rutas SSR (Server/Prerender)
├── app.config.ts            # Configuración de la app
├── app.config.server.ts     # Configuración SSR
└── app.component.ts         # Componente raíz
```

---

## 3. Patrones de Diseño

### 3.1 Herencia de Componentes

```
BaseComponent (abstract)
├── Manejo de subscripciones RxJS (auto-unsubscribe en ngOnDestroy)
├── Sistema de alertas (SweetAlert2)
├── Helpers de datos (fetchData, fetchById)
├── Validación de formularios
├── Permisos (carga por módulo)
└── Constantes (ESTADO_CANCHA, TITULO_LOGO1,TITULO_LOGO2)

    ↓ extiende

BaseSearchComponent (abstract)
├── Estado de paginación (page, pageSize, total)
├── Estado de filtros
├── Estado de ordenamiento (sort)
└── Métodos de actualización (updatePage, updateFilter, updateSort)

    ↓ extiende

Componentes concretos (CanchasComponent, ListaReservasComponent, etc.)
```

### 3.2 Herencia de Servicios

```
BaseService (no inyectable)
├── Constructor recibe HttpClient + path
├── baseUrl (getter): ConfigService.apiUrl + path
├── getRequest<T>()
├── postRequest<TReq, TRes>()
├── putRequest<TReq, TRes>()
├── deleteRequest<T>()
├── patchRequest<TReq, TRes>()
├── postRequestFile() / getRequestFile() (descarga blobs)
├── postRequestForm<T>() (multipart)
└── postRequestWithCredentials<TReq, TRes>() (CORS)

    ↓ extiende

Servicios concretos
├── CanchaService (/Cancha)
├── ReservaService (/Reserva)
├── PagoService (/Pago)
├── UsersService (/Usuario)
├── CanchaFavoritaService (/CanchaFavorita)
├── DisponibilidadService (/Disponibilidad)
├── TipoDeporteService (/TipoDeporte)
├── CanchaEstadoService (/EstadoCancha)
└── UbigeoService (/Ubigeo)
```

### 3.3 Patrón Strategy (OAuth)

```
OAuthStrategy (interfaz)
├── initialize()
├── login()
├── logout()
├── getSuccessMessage()
└── getErrorMessage()

    ↓ implementan

GoogleOAuthStrategy
└── Google One Tap SDK

FacebookOAuthStrategy
└── Facebook JS SDK

OAuthRegistryService
└── Map<string, OAuthStrategy>

OAuthHandlerService
└── Orquesta: estrategia → backend → AuthService → navegación
```

### 3.4 APP_INITIALIZER

```typescript
// app.config.ts
provideAppInitializer(() => {
  const configService = inject(ConfigService);
  return configService.load();  // GET /api/config antes de renderizar
});
```

** Datos cargados:**
- `apiUrl`: URL base de la API backend
- `mapboxToken`: Token de acceso a Mapbox GL

### 3.5 Cadena de Interceptores HTTP

```
Request HTTP
    ↓
loadingInterceptor
├── Muestra loading global (ngx-ui-loader)
├── Soporta SKIP_LOADING por request
└── Oculta loading en finalize()

    ↓
tokenInterceptor
├── Verifica isAuthenticated()
├── Agrega header: Authorization: Bearer <token>
└── Clona request si está autenticado

    ↓
Backend API
```

### 3.6 Lazy Loading de Rutas

```typescript
// app.routes.ts
{ path: 'cancha', loadChildren: () => import('./features/canchas/cancha.routes') }
{ path: 'auth', loadChildren: () => import('./features/auth/auth.routes') }
{ path: 'pago', loadChildren: () => import('./features/pago/pago.routes') }
{ path: 'mis-reservas', loadChildren: () => import('./features/mis-reservas/mis-reservas.routes') }
{ path: 'perfil', loadChildren: () => import('./features/user-profile/user-profile.routes') }
```

### 3.7 SSR con RenderMode

```typescript
// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  { path: 'cancha/:id', renderMode: RenderMode.Server },  // SSR dinámico (SEO)
  { path: '**', renderMode: RenderMode.Prerender }         // Prerender estático
];
```

---

## 4. Flujo de Autenticación

### 4.1 Login Tradicional

```
1. LoginComponent
   └── UsersService.login(LoginModel)
       └── POST /Usuario/login { applicationCode: 'Cliente', userName, password }

2. Backend retorna ResponseDto<LoginResultModel>
   └── { accessToken: { access_token, expires_in } }

3. AuthService.logIn(accessToken)
   ├── Guarda token en localStorage['access_token_${appCode}']
   ├── Decodifica JWT con jwtDecode()
   │   └── Extrae claims: UserId, email, UserName, DisplayName, Telefono, Roles
   ├── Emite User via Subject<User> (user$)
   └── Carga favoritos (dynamic import para evitar dependencia circular)

4. Navegación
   ├── Si existe redirect_after_login en sessionStorage → navega ahí
   └── Si no → navega a '/'
```

### 4.2 Login OAuth

```
1. LoginComponent → click "Google" / "Facebook"

2. OAuthHandlerService.handleLogin(provider)
   └── OAuthRegistryService.getStrategy(provider)

3. Estrategia (GoogleOAuthStrategy / FacebookOAuthStrategy)
   ├── initialize() - Inicializa SDK del proveedor
   └── login() - Retorna Promise<string> (token del proveedor)

4. OAuthHandlerService
   └── UsersService.loginAndCreate({ provider, token })
       └── POST /Usuario/client/loginAndCreate

5. Backend crea usuario si no existe → retorna JWT
   └── Mismo flujo que login tradicional desde aquí
```

### 4.3 Mantenimiento de Sesión (KeepAlive)

```
1. AuthService.keepAlive() se ejecuta periódicamente
   ├── Decodifica payload del JWT (sin verificar firma)
   ├── Si faltan ≤ 5 minutos para expirar:
   │   └── UsersService.renewSession() → nuevo access_token
   └── Reemplaza token en localStorage
```

### 4.4 Logout

```
1. AuthService.logOut() / logoutSession()
   ├── Si logoutSession(): extrae LogId del JWT
   │   └── UsersService.logoutSession(logId)
   ├── Limpia favoritos (dynamic import)
   ├── Remueve token de localStorage
   ├── Limpia sessionStorage
   └── Navega a /auth/login
```

---

## 5. Comunicación HTTP

### 5.1 BaseService

Todos los servicios extienden de `BaseService`:

```typescript
// Ejemplo: CanchaService
export class CanchaService extends BaseService {
  constructor(http: HttpClient) {
    super(http, '/Cancha');  // path del recurso
  }

  search(filter: SearchCanchaFilter) {
    return this.postRequest<SearchCanchaFilter, QueryResultsModel<SearchCancha>>('/search', filter);
  }
}
```

### 5.2 Configuración de URLs

```
ConfigService.apiUrl (cargada desde /api/config)
    + path del servicio (ej: '/Cancha')
    + recurso (ej: '/search')
    = URL completa: https://api.ejemplo.com/Cancha/search
```

### 5.3 Headers Automáticos

| Tipo | Content-Type | Uso |
|------|--------------|-----|
| JSON (default) | application/json | CRUD estándar |
| Multipart | multipart/form-data | Subida de archivos |
| Blob | - | Descarga de reportes |
| CORS | application/json + withCredentials | Peticiones con credenciales |

---

## 6. Manejo de Estado

### 6.1 Signals de Angular

```typescript
// CanchaFavoritaService
private _favoritos = signal<Map<number, GetCanchaFavorita>>(new Map());
favoritos = this._favoritos.asReadonly();

// LoadingService
private _loading = signal<boolean>(false);
loading = this._loading.asReadonly();
```

### 6.2 Subjects (RxJS)

```typescript
// AuthService
private userSubject = new Subject<User>();
user$ = this.userSubject.asObservable();
```

### 6.3 Almacenamiento Local

| Clave | Tipo | Propósito |
|-------|------|-----------|
| `access_token_${appCode}` | localStorage | Token JWT |
| `reserva_draft_${canchaId}` | localStorage | Borrador de reserva en curso |
| `redirect_after_login` | sessionStorage | URL de redirección post-login |
| `language` | localStorage | Idioma seleccionado |

---

## 7. Estilos y Diseño

### 7.1 Paleta de Colores (Tailwind v4)

| Familia | Uso | Ejemplo |
|---------|-----|---------|
| primary (teal) | Color principal de marca | Botones primarios, acentos |
| secondary (sky) | Elementos secundarios | Badges, chips de deporte |
| accent (gold) | CTAs potentes | Alertas importantes |
| neutral (slate) | Fondos, texto | Backgrounds, borders |

### 7.2 Clases CSS Reutilizables

```css
/* Botones */
.btn-primary, .btn-secondary, .btn-accent
.btn-outline-primary, .btn-outline-secondary, .btn-outline-accent

/* Inputs */
.input-sm, .input-base, .select-base, .textarea-base

/* Tarjetas */
.content-card, .card-primary, .card-secondary, .enhanced-card

/* Layout */
.page-wrapper, .page-container, .section-container
.grid-responsive-2, .grid-responsive-3, .grid-responsive-4

/* Estados */
.estado-pendiente, .estado-confirmado, .estado-cancelado, .estado-expirado
.status-disponible, .status-mantenimiento, .status-ocupado

/* Animaciones */
.fade-in-up, .slide-in-up, .pulse-animation, .float-animation

/* Scrollbar */
.scrollbar-hide, .scrollbar-thin
```

### 7.3 Responsive Design

- **Mobile-first**: Estilos base para móvil, breakpoints ascendentes
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Componente ResponsiveService**: Detección de dispositivo via BreakpointObserver

---

## 8. Despliegue

### 8.1 Docker Multi-Stage Build

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
RUN npm ci
RUN npm run build  # Genera dist/court-reservation-public/

# Stage 2: Runtime
FROM node:22-alpine
COPY --from=builder /app/dist/court-reservation-public ./
RUN npm ci --only=production
ENV PORT=4000
EXPOSE 4000
USER node
CMD ["node", "server/server.mjs"]
```

### 8.2 Configuración de Ambientes

```typescript
// environments/environment.development.ts
export const environment = {
  production: false,
  application: { code: 'Cliente' },
  mapbox: { accessToken: '...' },
  apiUrl: 'http://localhost:5000/api'
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  application: { code: 'Cliente' },
  mapbox: { accessToken: '...' },
  apiUrl: 'https://api.reservacanchas.com/api'
};
```

### 8.3 Scripts de Build

```bash
ng serve                    # Desarrollo local (localhost:4200)
ng build                    # Build producción
ng build --configuration development  # Build sin optimizaciones
node dist/court-reservation-public/server/server.mjs  # Ejecutar SSR
```

---

## 9. Consideraciones Técnicas

### 9.1 SSR Compatibility

- `AuthService` y `AuthGuard` verifican `isPlatformBrowser()` antes de acceder a `localStorage`
- `NavVarComponent` verifica `typeof window !== 'undefined'`
- Las rutas usan `RenderMode.Server` para SEO (detalle de cancha) y `RenderMode.Prerender` para el resto

### 9.2 Performance

- **Lazy loading**: Cada feature se carga bajo demanda
- **Dynamic imports**: AuthService importa CanchaFavoritaService dinámicamente para evitar dependencias circulares
- **Signals**: Estado reactivo sin ciclos de detección de cambios
- **shareReplay**: Servicios de breakpoint usan `shareReplay({ bufferSize: 1, refCount: true })`

### 9.3 Seguridad

- Token JWT en localStorage (no en cookies httpOnly)
- Interceptor agrega Authorization header automáticamente
- AuthGuard protege rutas sensibles
- Validación de inputs en formularios reactivos

### 9.4 Observaciones

1. **Duplicación en models/**: Existen dos conjuntos paralelos de modelos de paginación (`query/` y `grid/`)
2. **Interceptor legacy**: `token.interceptor.ts` (clase) existe pero no se usa
3. **LanguageInterceptor inactivo**: No se envía header `Accept-Language`
4. **Permisos incompletos**: Solo hay permisos de ejemplo, no específicos del dominio
