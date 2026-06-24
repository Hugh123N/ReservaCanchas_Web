---
name: servicios
description: Servicios HTTP, BaseService, patrón CRUD, comunicación con backend
---

## 1. Estructura de un Servicio

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '@base/services/base.service';
import { ResponseDto, ResponseBaseDto } from '@base/models/api/response.dto';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { QueryResultsModel } from '@base/models/query/query-results.model';

import { MiModel } from '../model/mi.model';
import { CreateMiModel } from '../model/create-mi.model';
import { UpdateMiModel } from '../model/update-mi.model';

@Injectable({ providedIn: 'root' })
export class MiService extends BaseService {

  constructor(http: HttpClient) {
    super(http, '/MiRecurso');
  }

  get(id: number): Observable<ResponseDto<MiModel>> {
    return this.getRequest<ResponseDto<MiModel>>(`/${id}`);
  }

  create(body: CreateMiModel): Observable<ResponseDto<MiModel>> {
    return this.postRequest<CreateMiModel, ResponseDto<MiModel>>('', body);
  }

  update(body: UpdateMiModel): Observable<ResponseDto<MiModel>> {
    return this.putRequest<UpdateMiModel, ResponseDto<MiModel>>('', body);
  }

  delete(id: number): Observable<ResponseBaseDto> {
    return this.deleteRequest<ResponseBaseDto>(`/${id}`);
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<MiModel>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<MiModel>>>('/search', body);
  }
}
```

---

## 2. Métodos HTTP Disponibles en BaseService

| Método | Uso | Ejemplo |
|--------|-----|---------|
| `getRequest<T>(resource)` | GET simple | `this.getRequest<Resp>('/'+id)` |
| `postRequest<TReq, TRes>(resource, body)` | POST con body | `this.postRequest<Req, Resp>('/search', body)` |
| `putRequest<TReq, TRes>(resource, body)` | PUT con body | `this.putRequest<Req, Resp>('', body)` |
| `deleteRequest<T>(resource)` | DELETE | `this.deleteRequest<Resp>('/'+id)` |
| `patchRequest<TReq, TRes>(resource, body)` | PATCH con body | `this.patchRequest<Req, Resp>('', body)` |
| `postRequestFile(resource, body, fileName)` | POST blob (descarga) | `this.postRequestFile('/report', body, 'reporte.xlsx')` |
| `getRequestFile(resource, fileName)` | GET blob (descarga) | `this.getRequestFile('/export', 'datos.csv')` |
| `postRequestForm<T>(resource, form)` | POST multipart | `this.postRequestForm<Resp>('/upload', formData)` |

---

## 3. Helpers de BaseComponent: fetchData y fetchById

BaseComponent provee helpers que manejan la suscripción, validación de `isValid`, y errores automáticamente.

> **REGLA**: fetchData y fetchById ya hacen `this.subscriptions.push()` internamente. BaseComponent los limpia en `ngOnDestroy`. Solo necesitas `super.ngOnDestroy()`.

### fetchData - Para arrays

Limpia y llena un array target con la respuesta del servicio.

```typescript
fetchData<T>(
  serviceCall: Observable<{ isValid: boolean; data: T[] }>,
  targetArray: T[]
): void
```

```typescript
// Ejemplo: cargar listado
items: GetEntidad[] = [];

loadData(): void {
  this.fetchData<GetEntidad>(this.entidadService.search(queryParams), this.items);
}

// Solo necesitas super.ngOnDestroy() - NO takeUntil
override ngOnDestroy(): void {
  super.ngOnDestroy();
}
```

### fetchById - Para objetos individuales

Ejecuta un callback con la data si la respuesta es válida.

```typescript
fetchById<T>(
  serviceCall: Observable<{ isValid: boolean; data: T }>,
  target: (data: T) => void
): void
```

```typescript
// Ejemplo: cargar un registro por ID
selectedItem: GetEntidad | null = null;

loadItem(id: number): void {
  this.fetchById<GetEntidad>(
    this.entidadService.get(id),
    (data) => { this.selectedItem = data; }
  );
}

// Solo necesitas super.ngOnDestroy()
override ngOnDestroy(): void {
  super.ngOnDestroy();
}
```

### ¿Cuándo usar cada uno?

| Método | Cuando usar | Ejemplo | Limpieza |
|--------|-------------|---------|----------|
| `fetchData` | Respuesta es un array `T[]` | Listados, catálogos, selects | Auto (subscriptions) |
| `fetchById` | Respuesta es un objeto `T` | Detalle, edición, obtener uno | Auto (subscriptions) |
| `subscribe` + `takeUntil` | CREATE, UPDATE, DELETE, lógica custom | Formularios, acciones | Manual (Subject) |

### Suscripciones manuales con takeUntil (cuando los helpers no aplican)

Para operaciones CRUD o cuando necesitas lógica custom, usar `takeUntil`:

```typescript
private unsubscribe = new Subject<void>();

createItem(): void {
  this.miService.create(datos)
    .pipe(takeUntil(this.unsubscribe))
    .subscribe({
      next: (response) => {
        if (response.isValid) {
          this.openSuccessAlert('Creado exitosamente');
        }
      },
      error: (error) => this.openErrorAlert(error)
    });
}

// IMPORTANTE: takeUntil necesita limpieza manual + super
override ngOnDestroy(): void {
  this.unsubscribe.next();
  this.unsubscribe.complete();
  super.ngOnDestroy();
}
```

> **REGLA**: Siempre llamar `super.ngOnDestroy()` al final, sin importar el patrón usado.

---

## 4. Consumo en Componentes

```typescript
import { Subject, takeUntil } from 'rxjs';

export class MiComponente implements OnInit, OnDestroy {
  private unsubscribe = new Subject<void>();
  items: MiModel[] = [];

  constructor(private miService: MiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.miService.search(queryParams)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (response) => {
          if (response.isValid && response.data) {
            this.items = response.data.items;
          }
        },
        error: (error) => {
          this.openErrorAlert(error);
        }
      });
  }

  deleteItem(id: number): void {
    this.confirmAction('¿Está seguro de eliminar?').then((confirmed) => {
      if (confirmed) {
        this.miService.delete(id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: (response) => {
              if (response.isValid) {
                this.openSuccessAlert('Eliminado exitosamente');
                this.loadData();
              }
            },
            error: (error) => this.openErrorAlert(error)
          });
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

---

## 5. Respuestas del Backend

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

---

## 6. Más Info

Para arquitectura general → skill("angular-core")
Para patrones de UI → skill("patrones")
Para estado (Signals, RxJS) → skill("estado")
