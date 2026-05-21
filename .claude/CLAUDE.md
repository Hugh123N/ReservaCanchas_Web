# ReservaCanchas Web - Reglas del Proyecto

## 📋 Stack Tecnológico

- **Framework**: Angular 20.3.6 (Standalone Components)
- **TypeScript**: 5.9.3 (Strict Mode)
- **Arquitectura**: SSR, sin NgModules
- **Estilos**: Tailwind CSS v4 + Angular Material
- **Backend**: API REST `http://10.147.18.108:9090/api`

---

## 🏗️ Estructura

### Path Aliases
```
@environments/* → src/environments/*
@base/*        → src/app/base/*
@core/*        → src/app/core/*
@shared/*      → src/app/shared/*
```

### Organización por Features
```
features/[nombre]/
├── components/
├── pages/
└── core/
    ├── model/
    ├── services/
    └── types/
```

---

## 🎯 Reglas Obligatorias

### 1. Componentes Standalone
```typescript
@Component({
  selector: 'app-nombre',
  standalone: true,  // ✅ OBLIGATORIO
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nombre.component.html',
  styleUrl: './nombre.component.css'
})
export class NombreComponent extends BaseComponent implements OnInit {
  constructor(
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('NOMBRE_MODULO', viewContainerRef);
  }
}
```

**Reglas:**
- ❌ NO crear NgModules
- ✅ Siempre `standalone: true`
- ✅ Extender `BaseComponent` para features
- ✅ Inyectar `ViewContainerRef`

### 2. Servicios - Extender BaseService
```typescript
@Injectable({ providedIn: 'root' })
export class NombreService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.backend.baseApiUrl}/Nombre`);
  }

  get(id: number): Observable<ResponseDto<GetNombre>> {
    return this.getRequest<ResponseDto<GetNombre>>(`/${id}`);
  }

  create(body: CreateNombre): Observable<ResponseDto<GetNombre>> {
    return this.postRequest<CreateNombre, ResponseDto<GetNombre>>('', body);
  }
}
```

**Métodos disponibles**: `getRequest`, `postRequest`, `putRequest`, `deleteRequest`, `postRequestForm`, `postRequestFormFile`

### 3. Modelos - Patrón Base/Get/Create/Update
```typescript
export interface Cancha {
  nombre: string;
  idTipoCancha: number;
}

export interface GetCancha extends Cancha {
  idCancha?: number;
  tipoCancha?: TipoCancha;
}

export interface CreateCancha extends Cancha { }

export interface UpdateCancha extends Cancha {
  idCancha: number;
}
```

### 4. Respuestas - Usar ResponseDto
```typescript
this.service.get(id).subscribe({
  next: (response) => {
    if (response.isValid) {
      this.data = response.data;
    } else {
      this.openErrorAlert(response);
    }
  },
  error: (err) => this.openAlert(err)
});
```

### 5. Formularios Reactivos
```typescript
this.form = this.fb.group({
  campo: ['', [Validators.required, Validators.email]],
  telefono: ['', [Validators.pattern(/^(\+51|51)?[9][0-9]{8}$/)]]
});

onSubmit(): void {
  if (this.form.invalid) {
    Object.keys(this.form.controls).forEach(key =>
      this.form.controls[key].markAsTouched()
    );
    return;
  }
  // lógica
}
```

### 6. Suscripciones - Siempre limpiar
```typescript
private unsubscribe = new Subject<any>();

ngOnInit(): void {
  const sub = this.service.getData()
    .pipe(takeUntil(this.unsubscribe))
    .subscribe();

  this.subscriptions.push(sub); // BaseComponent limpia automáticamente
}
```

### 7. Routing - Lazy Loading
```typescript
export const routes: Routes = [
  {
    path: 'feature',
    loadChildren: () => import('./features/feature/feature.routes')
      .then(m => m.featureRoutes)
  }
];
```

---

## 🎨 Sistema de Diseño

### Regla de Oro
**✅ Verificar `styles.css` ANTES de agregar estilos en componentes**
- Estilos que se repiten 2+ veces → `styles.css` global
- Estilos únicos → `.component.css`
- **IMPORTANTE**: `.component.css` con `@apply` debe incluir `@reference` al inicio

### Paleta de Colores
```css
--color-primary: #9333EA;      /* Violeta */
--color-secondary: #06B6D4;    /* Aqua */
--color-accent: #F97316;       /* Naranja */
```

### Sistema Responsive (Mobile First)
**Breakpoints**: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`, `2xl:1536px`

#### Clases de Texto Responsive
```html
<!-- ✅ USAR SIEMPRE -->
<h1 class="title-main">Título Hero</h1>
<h2 class="title-main">Título Sección</h2>
<h3 class="text-lg font-semibold">Subtítulo</h3>
<p class="text-base">Texto párrafo</p>

<!-- ❌ NO USAR -->
<h1 class="text-4xl">Título</h1>
```

**Mapeo**:
- `.text-responsive-2xl` → `text-2xl sm:text-3xl md:text-4xl lg:text-5xl`
- `.text-responsive-xl` → `text-xl sm:text-2xl md:text-3xl`
- `.text-lg` → `text-lg sm:text-xl md:text-2xl`

#### Grids y Componentes
```html
<!-- Grids -->
<div class="grid-responsive-2">2 columnas</div>
<div class="grid-responsive-3">3 columnas</div>

<!-- Iconos -->
<mat-icon class="icon-lg">search</mat-icon>
```

### Botones Globales
```html
<button mat-raised-button class="btn-primary">Principal</button>
<button mat-raised-button class="btn-secondary">Secundario</button>
<button mat-stroked-button class="btn-outline-primary">Outline</button>
```

### Cards Globales
```html
<mat-card class="card-base">Card básica</mat-card>
<mat-card class="enhanced-card-hover">Card con hover</mat-card>
<mat-card class="glass-effect">Glassmorphism</mat-card>
```

### Hero Sections
```html
<section class="hero-section gradient-primary">
  <h1 class="title-main text-white">Título</h1>
</section>
```

### Animaciones
```html
<div class="animate-fade-in">Fade in</div>
<div class="animate-fade-in-up delay-200">Fade up con delay</div>
<div class="hover-lift">Elevación hover</div>
```

### ⚠️ Uso de @reference
**Si `.component.css` usa `@apply`, DEBES incluir `@reference`**:
```css
/* ✅ CORRECTO */
@reference "../../../../styles.css";

.mi-clase {
  @apply flex items-center gap-4;
}
```

**Calcular ruta**: Cuenta niveles hasta `src/`
- `src/app/features/canchas/pages/detalle/` = 5 niveles → `"../../../../../styles.css"`

---

## 💾 Nomenclatura

### Archivos
```
nombre-componente.component.ts
nombre.service.ts
nombre.model.ts / getModelo.model.ts
nombre.routes.ts
```

### Código
```typescript
// camelCase
selectedDate: DateOption;
loadData() { }

// PascalCase
export class CanchaService { }
export interface GetCancha { }

// UPPER_SNAKE_CASE
const ESTADO_CANCHA = {};

// Prefijos booleanos
isLoading: boolean;
hasPermission: boolean;
```

---

## 🔐 Autenticación

- **AuthGuard**: Verifica autenticación + permisos (ngx-permissions)
- **BaseComponent**: Provee `this.PERMISSIONS` por módulo

```typescript
// Redirección post-login
sessionStorage.setItem('redirect_after_login', '/ruta');
const redirect = sessionStorage.getItem('redirect_after_login');
if (redirect) {
  sessionStorage.removeItem('redirect_after_login');
  this.router.navigateByUrl(redirect);
}
```

---

## 🚀 Buenas Prácticas

### ✅ HACER
1. Usar standalone components
2. Extender BaseComponent/BaseService
3. Usar path aliases
4. Lazy loading
5. Limpiar suscripciones
6. Usar clases predefinidas de estilos
7. Validar formularios antes de submit

### ❌ NO HACER
1. NO crear NgModules
2. NO usar `any` type
3. NO hardcodear URLs
4. NO ignorar errores del backend
5. NO hacer HTTP directamente en componentes
6. NO repetir código

---

## 📡 Backend

### Endpoints Estándar
```
GET    /api/[Entity]/{id}     → Obtener por ID
POST   /api/[Entity]          → Crear
PUT    /api/[Entity]          → Actualizar
DELETE /api/[Entity]/{id}     → Eliminar
POST   /api/[Entity]/search   → Búsqueda (QueryParamsModel)
```

### QueryParams
```typescript
const params: QueryParamsModel = {
  pageParams: { pageNumber: 1, pageSize: 10 },
  sortParams: { field: 'nombre', direction: 'asc' },
  filters: { }
};
```

---

## 🛠️ Helpers de BaseComponent

### Alertas
```typescript
this.openSuccessAlert('Operación exitosa');
this.openErrorAlert(response);
this.openWarningAlert('Advertencia');
this.openAlert(response); // Auto-detecta
```

### Confirmaciones
```typescript
const confirmed = await this.confirmAction(
  '¿Está seguro?',
  'Esta acción no se puede deshacer'
);
```

### Fetch Helpers
```typescript
// Arrays
this.fetchData(this.service.getAll(), this.dataArray);

// Objeto único
this.fetchById(this.service.get(id), (data) => this.item = data);
```

---

## ⚡ Checklist Pre-Código

**ANTES de escribir código**:
1. ✅ ¿Es standalone component?
2. ✅ ¿Extiende BaseComponent/BaseService?
3. ✅ ¿Usa path aliases?
4. ✅ ¿Sigue patrón Base/Get/Create/Update?
5. ✅ ¿Usa clases predefinidas de estilos?
6. ✅ ¿Limpia suscripciones?
7. ✅ ¿Maneja errores correctamente?
