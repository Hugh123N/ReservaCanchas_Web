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
│   ├── entity/              # Entidades compartidas (horarios, días)
│   ├── planes/              # Catálogo de planes para proveedores
│   └── seo/                 # SEO: meta tags, sitemap, URLs amigables
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
// Rutas principales
{ path: '', loadComponent: () => import('./features/home/pages/home/home.component') }
{ path: 'planes', loadChildren: () => import('./features/planes/planes.routes') }

// Rutas de funcionalidad
{ path: 'cancha', loadChildren: () => import('./features/canchas/cancha.routes') }
{ path: 'auth', loadChildren: () => import('./features/auth/auth.routes') }
{ path: 'pago', loadChildren: () => import('./features/pago/pago.routes') }
{ path: 'mis-reservas', loadChildren: () => import('./features/mis-reservas/mis-reservas.routes') }
{ path: 'perfil', loadChildren: () => import('./features/user-profile/user-profile.routes') }

// Rutas SEO dinámicas (ciudad/deporte) - catch-all dinámico
{ path: ':parametro1', loadChildren: () => import('./features/seo/seo.routes') }
{ path: ':parametro1/:parametro2', loadChildren: () => import('./features/seo/seo.routes') }
```

### 3.7 SSR con RenderMode

```typescript
// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  // Rutas que requieren renderizado dinámico (auth, sesión)
  { path: 'auth', renderMode: RenderMode.Server },
  { path: 'mis-reservas', renderMode: RenderMode.Server },
  { path: 'perfil', renderMode: RenderMode.Server },
  { path: 'pago', renderMode: RenderMode.Server },

  // Detalle de cancha (SEO + dinámico)
  { path: 'cancha/:id', renderMode: RenderMode.Server },

  // Rutas SEO dinámicas - Server para resolver slugs
  { path: ':parametro1', renderMode: RenderMode.Server },
  { path: ':parametro1/:parametro2', renderMode: RenderMode.Server },

  // Rutas estáticas - Prerender
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'planes', renderMode: RenderMode.Prerender },

  // Todo lo demás - Prerender
  { path: '**', renderMode: RenderMode.Prerender }
];
```

### 3.8 Feature: SEO (features/seo/)

```
features/seo/
├── seo.routes.ts                          # Rutas SEO dinámicas
├── core/
│   ├── models/
│   │   └── seo-config.model.ts            # SeoConfig, SeoResolution, SitemapUrl
│   └── services/
│       ├── seo.service.ts                 # Meta tags, Open Graph, canonical URLs
│       ├── sitemap.service.ts             # Generación de sitemap XML
│       └── slug-resolver.service.ts       # Resolución de URLs amigables
└── pages/
    └── canchas-seo/
        ├── canchas-seo.component.ts       # Página dinámica SEO
        ├── canchas-seo.component.html
        └── canchas-seo.component.css
```

**Servicios SEO:**

| Servicio | Responsabilidad |
|----------|-----------------|
| `SeoService` | Actualiza title, meta description, keywords, Open Graph tags, canonical URL |
| `SitemapService` | Genera XML de sitemap (estáticas, ciudades, deportes, combinaciones, canchas) |
| `SlugResolverService` | Resuelve URLs como `/lima/futbol` → ciudad + deporte con cache |

**Flujo de URLs SEO:**
```
URL: /lima/futbol
    ↓
SlugResolverService.initialize() → carga ciudades y deportes del backend
    ↓
SlugResolverService.resolver('lima', 'futbol')
    ↓
Resolución: { ciudad: Lima, deporte: Fútbol, esValido: true }
    ↓
SeoService.setCanchasSEO('Lima', 'Fútbol')
    ↓
Canaliza search con filtros (codigoUbigeo, idTipoDeporte)
```

### 3.9 Feature: Planes (features/planes/)

```
features/planes/
├── planes.routes.ts                       # Rutas de planes
├── core/
│   ├── models/
│   │   ├── plan.model.ts                  # Plan, ListPlaneDto, GetPlaneDto
│   │   ├── plan-caracteristica.model.ts   # PlanCaracteristicaDto
│   │   ├── plan-limite.model.ts           # PlanLimiteDto
│   │   ├── plan-tarifa.model.ts           # GetPlanTarifaDto
│   │   └── index.ts                       # Barrel exports
│   └── services/
│       └── plan.service.ts                # PlanService (GET /Plane/list)
└── pages/
    └── planes-catalogo/
        ├── planes-catalogo.component.ts   # Catálogo de planes para proveedores
        ├── planes-catalogo.component.html
        └── planes-catalogo.component.css
```

**Modelo de Planes:**
```typescript
interface ListPlaneDto {
  idPlane: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  planCaracteristicas: PlanCaracteristicaDto[];  // Características del plan
  planTarifa: GetPlanTarifaDto[];                // Tarifas (mensual, anual)
  planLimite: PlanLimiteDto[];                   // Límites (canchas, usuarios)
  precio?: number;
  icono?: string;
  destacado?: boolean;
}
```

**Flujo de Selección de Plan:**
```
PlanesCatalogoComponent
    → GET /Plane/list → Lista de planes
    → Click "Seleccionar Plan"
    → window.open('https://gestion.reservafast.com/onboarding/{idPlan}')
    → Redirige a plataforma de onboarding
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
1. AppComponent inicia AuthService.initializeSession() al cargar la aplicación
   ├── Restaura el JWT válido guardado y comprueba exp inmediatamente
   ├── SessionExpiryService vigila el reloj cada segundo fuera de Angular
   └── A ≤ 5 minutos muestra SessionWarningComponent global, independiente del navbar
2. "Mantener sesión" ejecuta keepAlive(): Observable<boolean>
   ├── Comparte una solicitud; timeout de 15 segundos sin bloquear la pantalla
   ├── Conserva la vigilancia durante la renovación y permite reintentar ante fallo
   ├── Valida identidad, UserIdNegocio y que exp aumente antes de guardar el JWT
   └── Ignora respuestas de sesiones anteriores o que ya expiraron
3. Al vencer, cerrar manualmente o recibir 401 autenticado: logoutSession()
4. storage, focus y visibilitychange sincronizan otras pestañas y suspensión del navegador
```

### 4.4 Logout

```
1. AuthService.logOut() / logoutSession()
   ├── Cancela renovación y detiene la vigilancia de forma inmediata e idempotente
   ├── Remueve token de localStorage
   ├── Limpia sessionStorage
   ├── Notifica perfil vacío y cierra diálogos abiertos
   ├── Limpia favoritos (dynamic import protegido contra sesiones posteriores)
   └── Navega a /auth/login
```

El cierre es local: los métodos de logout de UsersService son simulados y no revocan JWT en el servidor.
Ver [FLUJO-AUTO-LOGOUT.md](FLUJO-AUTO-LOGOUT.md) para pruebas y casos cubiertos.

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

### 6.4 Caché de consultas maestras

- `UbigeoService.listAll()` y `TipoDeporteService.SelectCombo()` conservan sus respuestas en memoria mediante `CachedResponse<T>` (`base/services/cached-response.ts`).
- La primera suscripción inicia la petición; las suscripciones simultáneas y posteriores comparten el mismo observable con `shareReplay({ bufferSize: 1, refCount: false })`.
- Solo se conservan respuestas con `isValid: true` y datos no nulos. Los errores HTTP y las respuestas inválidas permiten una nueva consulta en la siguiente llamada.
- La caché pertenece a cada instancia del servicio, sin persistencia en storage ni caducidad automática. En el navegador se pierde al recargar la aplicación.
- Ambos servicios exponen `clearCache()` para que la siguiente llamada vuelva a cargar el catálogo. La invalidación no cancela peticiones en curso ni actualiza automáticamente las vistas que ya recibieron los datos.
- Home, listado, mapa y resolución SEO reutilizan los mismos servicios. El listado sincroniza la ciudad de la URL tanto con respuestas HTTP diferidas como con respuestas inmediatas desde caché.

### 6.5 Detalle de cancha y retorno desde pago

- `CanchaService.get(id)` mantiene una caché en memoria por ID, con vigencia de **2 minutos desde la respuesta válida**. Se retienen hasta 20 detalles recientes y cada consumidor recibe una copia independiente.
- `CachedResponse<T>` admite un TTL opcional; los catálogos maestros conservan su comportamiento sin caducidad automática.
- `CanchaService.clearCache(id?)` permite invalidar un detalle o toda la caché. Las actualizaciones y eliminaciones exitosas invalidan el ID afectado.
- El detalle restaura el borrador antes de cargar la cancha, para funcionar con respuestas HTTP y con respuestas inmediatas desde caché. Se contempla el retorno desde pago (`?reserva=true`) y mediante el historial del navegador.
- La disponibilidad se guarda en estado local independiente y se consulta al restaurar una fecha o elegir otra. Al cambiar de fecha/cancha se cancelan las suscripciones anteriores para evitar respuestas obsoletas.
- Tras la consulta se conservan solo las horas seleccionadas que siguen disponibles, se renuevan sus precios e IDs y se recalculan duración y total. Los cambios se muestran en un aviso dentro del detalle.
- El botón de continuar permanece deshabilitado mientras la disponibilidad no esté verificada. Los errores ofrecen reintento.
- Como la UI reserva horas completas, se requieren ambas medias horas disponibles. `TimeOption.idsHorarioCancha` conserva los IDs reales de esas medias horas para enviarlos al crear la reserva, sin asumir que son consecutivos en las selecciones nuevas.
- El total se calcula a partir de las tarifas actuales de los horarios seleccionados, usando el precio base como fallback si no se proporciona una tarifa. Pago refleja la tarifa uniforme o indica que varía según el horario.

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

### 7.4 Navbar y navegación de cuenta

- `NavVarComponent` adapta el diseño de `reservafast-navbar.html`, conservando el logo y las rutas de la aplicación.
- En escritorio, la cuenta se abre con `CdkMenu`: avatar con iniciales, nombre, correo y acciones de perfil, reservas, panel proveedor y cierre de sesión.
- Hasta **980px**, la navegación utiliza un panel lateral con `Dialog` de Angular CDK. Incluye backdrop, bloqueo del scroll, foco contenido y restaurado al cerrar, cierre con Escape y limpieza al navegar o cambiar a escritorio.
- Los estilos visuales son propios del navbar, con los tokens del proyecto y los botones globales; los iconos lineales se encuentran en `assets/images/icons/navbar.svg`.
- Home activa `[showOwnerNotice]="true"` para mostrar la franja descartable para dueños encima del header. El navbar se mantiene fijo al desplazarse y respeta la preferencia de movimiento reducido.

### 7.5 Exploración de canchas en el mapa

- Hasta **1024px**, el mapa ocupa el espacio bajo los filtros, sin lista inferior. Un marcador seleccionado muestra una ficha flotante con foto, nombre, dirección, precio y enlace al detalle. El hover también selecciona la ficha y esta permanece abierta al retirar el puntero; se cierra con su botón o al tocar el fondo del mapa.
- En móvil/tablet, los filtros del encabezado se resumen en un único campo pulsable con deporte, ubicación y lupa a la derecha (por ejemplo, “Fútbol • Lima”). Toda su superficie abre el modal; los campos individuales y chips permanecen en escritorio.
- En escritorio se mantiene una lista lateral compacta sincronizada con la selección de marcadores. El mapa se conserva al cambiar de tamaño y un `ResizeObserver` ajusta el canvas.
- `UbicacionAutocompleteComponent` ofrece provincias y distritos del catálogo compartido. `crearOpcionesUbicacion()` genera códigos de 4 dígitos para provincias y 6 para distritos; `/Cancha/search` admite ambos mediante `StartsWith` de `CodigoUbigeo`.
- El nombre se busca en el backend con debounce de 350ms. Un `switchMap` cancela la consulta previa inmediatamente al cambiar filtros, evitando resultados fuera de orden. Cambiar filtros reinicia la página y cierra la ficha anterior.
- Los filtros combinan nombre, ubicación, deporte, fecha, favoritos y área visible. El modal incluye también el nombre de cancha, sincroniza los controles del escritorio al aplicar, usa el mismo campo `idTipoDeporte` que la API y exige sesión para aplicar favoritos. “Limpiar todo” elimina también los criterios heredados de área y hora; cancelar el modal conserva la búsqueda actual.
- En escritorio, la lista carga automáticamente bloques de 20 resultados mediante `IntersectionObserver` sobre el final del contenedor desplazable. Las siguientes páginas se agregan sin duplicar IDs, reiniciar el scroll, perder la selección ni volver a encuadrar el mapa; solo se añaden sus nuevos marcadores.
- La carga incremental tiene estado y error independientes. Se evita solicitar dos páginas a la vez, se permite reintentar la misma página tras un fallo y se detiene al alcanzar el total o recibir una página incompleta/vacía. El botón “Cargar más canchas” sirve también como alternativa accesible.
- En móvil/tablet se conserva la navegación por páginas de 20 desde el contador del mapa. Al alternar entre modos después de avanzar páginas se reinicia la búsqueda en la primera página. Los filtros y la búsqueda por zona también reinician la lista y cancelan cualquier carga anterior.
- El contador distingue las canchas ubicadas del total de la búsqueda. Los registros sin coordenadas válidas se excluyen del mapa, pero el avance de páginas se calcula usando la paginación del backend.
- “Buscar en esta zona” se activa con desplazamientos del usuario y conserva el encuadre al consultar. Los movimientos programáticos de selección o ajuste de resultados no activan ese aviso.
- Los marcadores son botones accesibles. Tocar o pulsar Enter abre la selección; la navegación ocurre únicamente al activar “Ver cancha”. La ficha deja espacio para los controles y atribución de Mapbox.

### 7.6 Banners del home

- `HomeComponent.slides` define imagen, título segmentado y descripción de cada banner, en el orden reserva → deportes → cercanía. Los banners muestran únicamente texto, sin filas de iconos.
- Se utilizan los seis WebP de `assets/banners/`: `<picture>` selecciona la variante móvil hasta **700px**. En el banner de deportes de escritorio, el fondo verde petróleo se limita al lado izquierdo detrás del texto blanco y turquesa, con una transición hacia las fotografías; el lado derecho conserva la imagen original y sus márgenes claros.
- El buscador flotante conserva su posición, diseño y filtros de ciudad, deporte, fecha y hora; envía los parámetros a `/cancha/canchas`.
- Imagen y texto cambian juntos cada cinco segundos. Se mantienen los tres puntos originales, abajo a la derecha en escritorio y arriba centrados en móvil, sin botón de pausa. Con movimiento reducido o en SSR no programa intervalos.
- Solo el banner activo queda disponible para tecnologías de asistencia. El primer título conserva el `h1` y las imágenes son decorativas porque el contenido se renderiza como HTML.

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
- Las rutas SEO dinámicas (`/:parametro1`, `/:parametro1/:parametro2`) usan `RenderMode.Server` para resolver slugs
- Detalle de cancha (`/cancha/:id`) usa `RenderMode.Server` para SEO
- Rutas estáticas (home, planes) usan `RenderMode.Prerender`

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
5. **SEO hardcodeado**: URLs base (`reservafast.com`) hardcodeadas en SeoService y SitemapService
6. **SlugResolver con cache**: Cache en memoria, se reinicia al recargar (se inicializa bajo demanda)
