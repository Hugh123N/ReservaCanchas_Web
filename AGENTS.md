# AGENTS.md - Guía para IA en ReservaCanchas Web

## Propósito

Este archivo contiene las reglas e instrucciones que la IA debe seguir al trabajar en este proyecto. Contiene todas las instrucciones específicas de implementación.

---

## Documentación del Proyecto

| Documento | Ubicación | Propósito |
|-----------|-----------|-----------|
| `ARQUITECTURA.md` | `docs/ARQUITECTURA.md` | Arquitectura técnica del sistema |
| `FLUJOS-NEGOCIO.md` | `docs/FLUJOS-NEGOCIO.md` | Flujos y procesos de negocio |
| `arquitectura/SKILL.md` | `.opencode/skills/arquitectura/` | Estructura de features, index.ts, creación |
| `angular-core/SKILL.md` | `.opencode/skills/angular-core/` | Directivas, componentes, I/O |
| `formularios/SKILL.md` | `.opencode/skills/formularios/` | Formularios reactivos, validaciones |
| `estilos/SKILL.md` | `.opencode/skills/estilos/` | Tailwind, clases CSS, responsive |
| `servicios/SKILL.md` | `.opencode/skills/servicios/` | BaseService, HTTP, CRUD |
| `patrones/SKILL.md` | `.opencode/skills/patrones/` | Páginas, dialogs, filtros |
| `estado/SKILL.md` | `.opencode/skills/estado/` | Signals, RxJS, localStorage |
| `tailwind-4-docs/SKILL.md` | `.opencode/skills/tailwind-4-docs/` | Documentación Tailwind v4, migración |
| `angular-developer/SKILL.md` | `.opencode/skills/angular-developer/` | Angular 20+ signals, DI, routing, SSR, testing |

---

## Reglas de Implementación

### 1. Directivas de Control Flow

**OBLIGATORIO**: Usar SIEMPRE la sintaxis moderna de Angular.

```html
<!-- ✅ CORRECTO -->
@if (condition) { ... }
@for (item of items; track item.id) { ... }
@switch (value) { @case ('x') { ... } }

<!-- ❌ PROHIBIDO -->
<div *ngIf="condition">...</div>
<div *ngFor="let item of items">...</div>
<div [ngSwitch]="value">...</div>
```

### 2. Componentes

```typescript
// ✅ Estructura obligatoria
@Component({
  selector: 'app-nombre',
  standalone: true,  // SIEMPRE true
  imports: [/* módulos necesarios */],
  templateUrl: './nombre.component.html',
  styleUrl: './nombre.component.css'
})
export class NombreComponent extends BaseComponent implements OnInit, OnDestroy {
  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super('MODULO', viewContainerRef);
  }
}
```

**Reglas**:
- SIEMPRE `standalone: true`
- SIEMPRE extender `BaseComponent` para features
- SIEMPRE inyectar `ViewContainerRef`
- SIEMPRE implementar `OnDestroy` si hay suscripciones

### 3. Servicios

```typescript
// ✅ Estructura obligatoria
@Injectable({ providedIn: 'root' })
export class NombreService extends BaseService {
  constructor(http: HttpClient) {
    super(http, '/NombreRecurso');
  }

  get(id: number): Observable<ResponseDto<GetNombre>> {
    return this.getRequest<ResponseDto<GetNombre>>(`/${id}`);
  }

  create(body: CreateNombre): Observable<ResponseDto<GetNombre>> {
    return this.postRequest<CreateNombre, ResponseDto<GetNombre>>('', body);
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<Nombre>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<Nombre>>>('/search', body);
  }
}
```

**Reglas**:
- SIEMPRE extender `BaseService`
- SIEMPRE usar `@Injectable({ providedIn: 'root' })`
- SIEMPRE tipar respuestas con `ResponseDto<T>`
- NUNCA hacer HTTP directamente en componentes

### 4. Formularios

```typescript
// ✅ Estructura obligatoria
this.miForm = this.fb.group({
  campo: ['', [Validators.required, Validators.email]],
  telefono: ['', [Validators.pattern(/^\d{8,15}$/)]]
}, {
  validators: passwordMatchValidator()  // Si aplica
});
```

**Reglas**:
- SIEMPRE usar `FormBuilder`
- SIEMPRE usar `Validators` para campos requeridos
- SIEMPRE validar antes de enviar con `validateForm()`
- SIEMPRE mostrar errores con `FormErrorComponent` o `@if` + `hasError()`
- Ver skill `formularios` para detalles

### 5. Estilos

**REGLA DE ORO**: Verificar `styles.css` ANTES de crear estilos nuevos.

```html
<!-- ✅ Usar clases predefinidas -->
<button class="btn-primary">Acción</button>
<div class="content-card">Contenido</div>
<h1 class="title-main text-primary-600">Título</h1>
<mat-icon class="icon-lg">search</mat-icon>

<!-- ❌ NO crear estilos que ya existen -->
<button style="background: #14B8A6; color: white;">...</button>
```

**REGLA: No usar Angular Material para formularios ni cards**

```html
<!-- ✅ CORRECTO - Inputs con Tailwind -->
<label class="form-label">Nombre</label>
<input class="input-base" formControlName="nombre" type="text" />
<app-form-error [control]="form.get('nombre')"></app-form-error>

<!-- ❌ PROHIBIDO - Angular Material para formularios -->
<mat-form-field appearance="outline">
  <mat-label>Nombre</mat-label>
  <input matInput formControlName="nombre" />
</mat-form-field>
```

**PERMITIDO usar Angular Material para**: `mat-icon`, `mat-spinner`, `mat-dialog`, `mat-menu`, `mat-toolbar`, `snackBar`

**Ver skill `estilos` para catálogo completo de clases.**

### 6. Suscripciones

```typescript
// ✅ Patrón obligatorio
private unsubscribe = new Subject<void>();

ngOnInit(): void {
  this.service.getData()
    .pipe(takeUntil(this.unsubscribe))
    .subscribe({ next: (r) => { /* ... */ } });
}

override ngOnDestroy(): void {
  this.unsubscribe.next();
  this.unsubscribe.complete();
  super.ngOnDestroy();
}
```

### 7. Rutas

```typescript
// ✅ Lazy loading obligatorio
{ path: 'feature', loadChildren: () => import('./features/feature/feature.routes').then(m => m.featureRoutes) }
```

### 8. Comentarios

**REGLA**: Comentar SOLO lo necesario. No documentar obviedades.

**✅ SI comentar**:
- Lógica compleja o no obvia (validaciones, algoritmos, transforms)
- Decisiones técnicas ("por qué" se hizo así, no "qué" hace)
- Workarounds o hacks por limitaciones de third-party
- Cases edge o validaciones que podrían confundir

**❌ NO comentar**:
- Declaración de variables, propiedades o parámetros
- Funciones cuyo nombre ya explica qué hacen
- Código autoexplicativo (`if (user.isAdmin)`, `return items.filter(...)`)
- Imports
- Templates HTML simples
- Bloques de código que simplemente repiten el nombre de la función

```typescript
// ❌ MAL - Comentarios innecesarios
/** Servicio de usuarios */
export class UsersService extends BaseService { }

// Variable que guarda el token
private token: string;

// Retorna los items filtrados
return items.filter(item => item.active);

// ✅ BIEN - Solo lo que aporta valor
// El backend requiere formato específico para fechas en timezone UTC
// por bug reportado en #123
const formattedDate = date.toISOString().split('T')[0];

// Workaround: Mapbox no soporta multipolygon, se envía como polygon
// https://github.com/mapbox/mapbox-gl-js/issues/xxxx
this.map.addSource({ type: 'geojson', data: geometry as any });
```

---

## Flujo de Trabajo para Nuevos Requerimientos

### Paso 1: Entender el Requerimiento
1. Leer completamente el requerimiento del usuario
2. Identificar si es: componente, servicio, feature completa, fix, etc.
3. Determinar qué features existentes se relacionan

### Paso 2: Buscar Patrones Existentes
1. Revisar skills en `.opencode/skills/` según la necesidad
2. Revisar `docs/ARQUITECTURA.md` para estructura
3. Revisar `docs/FLUJOS-NEGOCIO.md` para contexto de negocio
4. Si hay duda, buscar en `src/app/features/` si ya existe algo similar

### Paso 3: Implementar Siguiendo el Skill
1. Seguir las reglas de los skills modulares
2. Usar las clases de estilos predefinidas
3. Usar directivas modernas (@if, @for)
4. Extender BaseComponent/BaseService
5. Implementar loading y empty states

### Paso 4: Verificar
1. Ejecutar `npm run lint` si está disponible
2. Verificar que no hay errores de TypeScript
3. Verificar que los estilos usan clases predefinidas
4. Verificar que las suscripciones se limpian

---

## Tecnologías y Librerías

### Framework y Core
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Angular | 20.3.6 | Framework principal |
| TypeScript | 5.9.3 | Lenguaje |
| RxJS | 7.8.0 | Programación reactiva |
| Zone.js | 0.15.0 | Detección de cambios |

### UI y Estilos
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Angular Material | 20.2.9 | Componentes UI (dialogs, forms, etc.) |
| Tailwind CSS | 4.1.12 | Utilidades de estilos |
| SweetAlert2 | 11.6.13 | Alertas y modales |

### Funcionalidad
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Mapbox GL JS | 3.16.0 | Mapas interactivos |
| jwt-decode | 4.0.0 | Decodificación JWT |
| @ngx-translate | 16.0.4 | Internacionalización |
| ngx-permissions | 19.0.0 | Control de acceso |
| ngx-ui-loader | 19.0.0 | Loading global |

### SSR
| Tecnología | Versión | Uso |
|------------|---------|-----|
| @angular/ssr | 20.3.6 | Server-Side Rendering |
| Express | 4.18.2 | Servidor HTTP |

---

## Path Aliases

```typescript
@environments/* → src/environments/*
@base/*        → src/app/base/*
@core/*        → src/app/core/*
@shared/*      → src/app/shared/*
```

---

## Nomenclatura de Archivos

```
nombre-componente.component.ts    // Componentes
nombre.component.html             // Templates
nombre.component.css              // Estilos
nombre.service.ts                 // Servicios
nombre.model.ts                   // Modelos base
get-nombre.model.ts               // Modelo de respuesta
create-nombre.model.ts            // Modelo de creación
update-nombre.model.ts            // Modelo de actualización
nombre.routes.ts                  // Rutas
nombre.enum.ts                    // Enums
nombre.interface.ts               // Interfaces
nombre.utils.ts                   // Utilidades
nombre-validator.ts               // Validadores
```

---

## Endpoints Estándar del Backend

```
GET    /api/[Entity]/{id}           → Obtener por ID
POST   /api/[Entity]                → Crear
PUT    /api/[Entity]                → Actualizar
DELETE /api/[Entity]/{id}           → Eliminar
POST   /api/[Entity]/search         → Búsqueda paginada
GET    /api/[Entity]/SelectCombo    → Catálogo para selects
```

---

## Errores Comunes a Evitar

1. **NO usar `*ngIf`, `*ngFor`** → Usar `@if`, `@for`
2. **NO crear NgModules** → Todos los componentes son standalone
3. **NO hacer HTTP en componentes** → Usar servicios que extienden BaseService
4. **NO usar `any`** → Siempre tipar variables y parámetros
5. **NO hardcodear URLs** → Usar `ConfigService.apiUrl`
6. **NO ignorar errores** → Siempre suscribirse a `.error` en observables
7. **NO olvidar limpiar suscripciones** → Usar `takeUntil` + `ngOnDestroy`
8. **NO crear estilos que ya existen** → Verificar `styles.css` primero
9. **NO usar `ngClass`** → Preferir `[class]` o `[ngClass]` solo para objetos
10. **NO saltar loading/empty states** → Siempre implementar estados de carga

---

## Archivos de Ejemplo por Patrón

Cuando necesites implementar algo, busca el ejemplo más cercano:

| Necesidad | Archivo de Referencia |
|-----------|----------------------|
| Página con listado | `src/app/features/mis-reservas/components/lista-reservas/` |
| Formulario de login/register | `src/app/features/auth/pages/login/` o `register/` |
| Filtros de búsqueda | `src/app/features/mis-reservas/components/filtros-reservas/` |
| Detalle con modal | `src/app/features/mis-reservas/components/detalle-reserva/` |
| Card de entidad | `src/app/features/canchas/components/card-cancha/` |
| Pago/confirmación | `src/app/features/pago/components/payment/` |
| Servicio CRUD | `src/app/features/canchas/core/services/cancha.service.ts` |
| Servicio con acciones | `src/app/features/pago/core/services/pago.service.ts` |
| Modelo con herencia | `src/app/features/canchas/core/model/cancha.model.ts` |
| Enum con helpers | `src/app/shared/enums/estado-reserva.enum.ts` |

---

## Checklist Pre-Entrega

Antes de entregar cualquier implementación:

- [ ] Componente es `standalone: true`
- [ ] Usa `@if`, `@for`, `@switch` (nunca `*ngIf`, `*ngFor`)
- [ ] Extiende `BaseComponent` o `BaseSearchComponent`
- [ ] Servicio extiende `BaseService`
- [ ] Formularios usan `FormBuilder` y `Validators`
- [ ] Errores se muestran correctamente
- [ ] Estilos usan clases de `styles.css`
- [ ] Responsive con `grid-responsive-*`
- [ ] Loading y empty states implementados
- [ ] Suscripciones se limpian en `ngOnDestroy`
- [ ] No hay errores de TypeScript
- [ ] No hay código duplicado
