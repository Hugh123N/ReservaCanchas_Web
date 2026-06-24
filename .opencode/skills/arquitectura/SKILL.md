---
name: arquitectura
description: Estructura del proyecto, creación de features, index.ts, registro de rutas
---

## 1. Estructura del Proyecto

```
src/app/
├── base/                    # Infraestructura base (BaseComponent, BaseService, modelos API)
├── core/                    # Auth, interceptors, services transversales
├── shared/                  # Componentes, enums, interfaces, utils compartidos
├── features/                # Módulos de negocio
│   └── [nombre-feature]/
├── app.routes.ts            # Rutas principales
├── app.config.ts            # Configuración
└── app.component.ts         # Componente raíz
```

---

## 2. Estructura de una Feature

```
features/[nombre-feature]/
├── [nombre-feature].routes.ts           # Rutas de la feature
├── core/
│   ├── model/
│   │   ├── [entidad].model.ts           # Modelo base (campos compartidos)
│   │   ├── get[Entidad].model.ts        # Modelo de respuesta GET
│   │   ├── create[Entidad].model.ts     # Modelo de creación
│   │   ├── update[Entidad].model.ts     # Modelo de actualización
│   │   ├── search[Entidad].model.ts     # Modelo de búsqueda
│   │   └── index.ts                     # Exportaciones barrel
│   ├── services/
│   │   ├── [entidad].service.ts         # Servicio HTTP (extiende BaseService)
│   │   └── index.ts                     # Exportaciones barrel
│   └── types/
│       ├── [tipo].type.ts               # Tipos adicionales
│       └── index.ts
├── components/
│   ├── lista-[entidad]/
│   │   ├── lista-[entidad].component.ts
│   │   ├── lista-[entidad].component.html
│   │   └── lista-[entidad].component.css
│   ├── detalle-[entidad]/
│   │   ├── detalle-[entidad].component.ts
│   │   ├── detalle-[entidad].component.html
│   │   └── detalle-[entidad].component.css
│   └── filtros-[entidad]/
│       ├── filtros-[entidad].component.ts
│       ├── filtros-[entidad].component.html
│       └── filtros-[entidad].component.css
└── pages/
    └── [nombre-page]/
        ├── [nombre-page].component.ts
        ├── [nombre-page].component.html
        └── [nombre-page].component.css
```

---

## 3. Regla de index.ts (Barrel Exports)

**REGLA**: Si un directorio tiene **3 o más archivos** de exportación, crear `index.ts`.

### models/index.ts

```typescript
// Modelos base
export { Reserva } from './reserva.model';
export { CreateReserva } from './createReserva.model';
export { UpdateReserva } from './updateReserva.model';

// Modelos de respuesta
export { GetReserva } from './getReserva.model';
export { ReservaClienteDto } from './reservaCliente.model';

// Modelos de búsqueda
export { SearchReserva } from './searchReserva.model';
export { SearchReservaFilter } from './searchReservaFilter.model';
```

### services/index.ts

```typescript
export { ReservaService } from './reserva.service';
```

### ¿Cuándo crear index.ts?

| Archivos en carpeta | Acción |
|---------------------|--------|
| 1-2 archivos | NO crear index.ts |
| 3+ archivos | SÍ crear index.ts |
| Carpeta `model/` | SIEMPRE crear index.ts |
| Carpeta `services/` | SIEMPRE crear index.ts |

---

## 4. Creación de Feature - Checklist

### Paso 1: Crear estructura de carpetas

```
features/[nombre]/
├── [nombre].routes.ts
├── core/model/
├── core/services/
├── components/
└── pages/
```

### Paso 2: Crear modelos

**Patrón base/get/create/update:**

```typescript
// entidad.model.ts - Modelo base
export interface Entidad {
  campo1: string;
  campo2: number;
}

// getEntidad.model.ts - Modelo de respuesta
export interface GetEntidad extends Entidad {
  idEntidad?: number;
  campoAdicional?: TipoRelacion;
}

// createEntidad.model.ts
export interface CreateEntidad extends Entidad { }

// updateEntidad.model.ts
export interface UpdateEntidad extends Entidad {
  idEntidad: number;
}
```

### Paso 3: Crear servicio

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '@base/services/base.service';
import { ResponseDto } from '@base/models/api/response.dto';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { QueryResultsModel } from '@base/models/query/query-results.model';
import { GetEntidad } from '../model/getEntidad.model';
import { CreateEntidad } from '../model/createEntidad.model';
import { UpdateEntidad } from '../model/updateEntidad.model';

@Injectable({ providedIn: 'root' })
export class EntidadService extends BaseService {

  constructor(http: HttpClient) {
    super(http, '/Entidad');
  }

  get(id: number): Observable<ResponseDto<GetEntidad>> {
    return this.getRequest<ResponseDto<GetEntidad>>(`/${id}`);
  }

  create(body: CreateEntidad): Observable<ResponseDto<GetEntidad>> {
    return this.postRequest<CreateEntidad, ResponseDto<GetEntidad>>('', body);
  }

  update(body: UpdateEntidad): Observable<ResponseDto<GetEntidad>> {
    return this.putRequest<UpdateEntidad, ResponseDto<GetEntidad>>('', body);
  }

  delete(id: number): Observable<ResponseBaseDto> {
    return this.deleteRequest<ResponseBaseDto>(`/${id}`);
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<GetEntidad>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<GetEntidad>>>('/search', body);
  }
}
```

### Paso 4: Crear componente principal

```typescript
import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@base/components/base-component/base.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-lista-entidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-entidad.component.html',
  styleUrl: './lista-entidad.component.css'
})
export class ListaEntidadComponent extends BaseComponent implements OnInit {

  items: GetEntidad[] = [];
  isLoading = false;
  private unsubscribe = new Subject<void>();

  constructor(
    private entidadService: EntidadService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('MODULO_ENTIDAD', viewContainerRef);
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.entidadService.search(queryParams)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (response) => {
          if (response.isValid) {
            this.items = response.data.items;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.openErrorAlert(err);
          this.isLoading = false;
        }
      });
  }

  override ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    super.ngOnDestroy();
  }
}
```

### Paso 5: Crear ruta de feature

```typescript
// features/[nombre]/[nombre].routes.ts
import { Routes } from '@angular/router';

export const entidadRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/lista-entidad/lista-entidad.component').then(
        (m) => m.ListaEntidadComponent
      ),
    data: { title: 'Entidades' }
  }
];
```

### Paso 6: Registrar en app.routes.ts

```typescript
// app.routes.ts
{
  path: 'entidad',
  loadChildren: () =>
    import('./features/entidad/entidad.routes').then((m) => m.entidadRoutes)
}
```

---

## 5. Naming de Archivos

```
nombre-componente.component.ts    // Componentes
nombre.component.html             // Templates
nombre.component.css              // Estilos
nombre.service.ts                 // Servicios
nombre.model.ts                   // Modelo base
get-nombre.model.ts               // Modelo de respuesta
create-nombre.model.ts            // Modelo de creación
update-nombre.model.ts            // Modelo de actualización
nombre.routes.ts                  // Rutas
nombre.enum.ts                    // Enums
nombre.interface.ts               // Interfaces
```

---

## 6. Más Info

Para componentes y directivas → skill("angular-core")
Para formularios → skill("formularios")
Para estilos → skill("estilos")
Para servicios HTTP → skill("servicios")
