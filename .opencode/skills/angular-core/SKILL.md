---
name: angular-core
description: Directivas modernas, componentes standalone, inputs/outputs, suscripciones y base de componentes
---

## 1. Directivas Modernas de Angular

**REGLA OBLIGATORIA**: Usar SIEMPRE la sintaxis moderna de control flow (`@if`, `@for`, `@switch`). **NUNCA** usar `*ngIf`, `*ngFor`, `[ngSwitch]`.

### 1.1 @if - Condicional

```html
<!-- Simple -->
@if (isLoading) {
  <div class="loading-state">
    <mat-spinner diameter="60" color="primary"></mat-spinner>
  </div>
}

<!-- Con @else -->
@if (items.length > 0) {
  <div>Listado de items</div>
} @else {
  <div class="empty-state">
    <mat-icon class="empty-state-icon">inbox</mat-icon>
    <h3 class="empty-state-title">No hay elementos</h3>
  </div>
}

<!-- Con @else if -->
@if (status === 'loading') {
  <mat-spinner></mat-spinner>
} @else if (status === 'error') {
  <div class="error-message">Error al cargar</div>
} @else {
  <div>Contenido</div>
}
```

### 1.2 @for - Iteración

```html
<!-- Básico con track obligatorio -->
@for (item of items; track item.id) {
  <div class="content-card">{{ item.nombre }}</div>
}

<!-- Con variables de contexto -->
@for (item of items; track item.id; let i = $index; let last = $last) {
  <span>{{ item.nombre }}@if (!last) {, </span>}
}

<!-- Empty state para @for -->
@for (item of items; track item.id) {
  <div>{{ item.nombre }}</div>
} @empty {
  <div class="empty-state">
    <p>No se encontraron resultados</p>
  </div>
}
```

### 1.3 @switch - Multiples condiciones

```html
@switch (status) {
  @case ('loading') {
    <mat-spinner></mat-spinner>
  }
  @case ('error') {
    <div class="error-message">Error</div>
  }
  @case ('empty') {
    <div class="empty-state">Sin datos</div>
  }
  @default {
    <div>Contenido principal</div>
  }
}
```

---

## 2. Componentes Standalone

**REGLA**: Todos los componentes deben ser `standalone: true`. No usar `NgModule`.

### 2.1 Estructura Base de un Componente

```typescript
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './mi-componente.component.html',
  styleUrl: './mi-componente.component.css'
})
export class MiComponenteComponent implements OnInit, OnDestroy {
  // Lógica aquí
}
```

### 2.2 Extensión de BaseComponent

Para componentes que necesitan alertas, validación de formularios, o manejo de subscripciones:

```typescript
import { BaseComponent } from '@base/components/base-component/base.component';

@Component({
  selector: 'app-mi-feature',
  standalone: true,
  imports: [/* ... */],
  templateUrl: './mi-feature.component.html',
  styleUrl: './mi-feature.component.css'
})
export class MiFeatureComponent extends BaseComponent implements OnInit, OnDestroy {

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    this.loadData();
  }

  // Si SOLO usas fetchData/fetchById → solo llamar super:
  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  // Si además usas takeUntil → limpiar Subject + super:
  // override ngOnDestroy(): void {
  //   this.unsubscribe.next();
  //   this.unsubscribe.complete();
  //   super.ngOnDestroy();
  // }
}
```

### 2.2 Patrones de limpieza de suscripciones

**REGLA**: Siempre extender `BaseComponent` y llamar `super.ngOnDestroy()`.

| Patrón | Cuándo usar | Cómo funciona |
|--------|-------------|---------------|
| `fetchData` / `fetchById` | GET de datos (listados, detalle) | Auto-push a `this.subscriptions`, BaseComponent limpia |
| `takeUntil(subject)` | CREATE, UPDATE, DELETE, lógica custom | Subject manual que disparas en `ngOnDestroy` |

```typescript
// ✅ fetchData/fetchById → solo super.ngOnDestroy()
loadData(): void {
  this.fetchData<GetEntidad>(this.entidadService.search(queryParams), this.items);
}
override ngOnDestroy(): void {
  super.ngOnDestroy(); // BaseComponent limpia this.subscriptions
}

// ✅ takeUntil → Subject + super.ngOnDestroy()
createItem(): void {
  this.miService.create(datos)
    .pipe(takeUntil(this.unsubscribe))
    .subscribe({ /* ... */ });
}
override ngOnDestroy(): void {
  this.unsubscribe.next();
  this.unsubscribe.complete();
  super.ngOnDestroy();
}
```

### 2.3 Extensión de BaseSearchComponent

Para listados con paginación, filtros y ordenamiento:

```typescript
import { BaseSearchComponent } from '@base/components/base-search-component/search-base.component';

@Component({
  selector: 'app-mi-listado',
  standalone: true,
  imports: [/* ... */],
  templateUrl: './mi-listado.component.html',
  styleUrl: './mi-listado.component.css'
})
export class MiListadoComponent extends BaseSearchComponent implements OnInit {

  constructor(private miService: MiService) {
    super();
  }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    const queryParams = this.getPageParams();
    this.miService.search(queryParams).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.items = response.data.items;
          this.total = response.data.total;
        }
      }
    });
  }
}
```

---

## 3. Inputs y Outputs

### 3.1 Declaración de Inputs

```typescript
@Input() isLoading: boolean = false;
@Input() mode: 'login' | 'register' = 'login';
@Input() items: Item[] = [];
@Input() filtrosActivos: SearchFilterDto = {};
@Input() maxWidth: 'large' | 'medium' = 'large';
```

### 3.2 Declaración de Outputs

```typescript
@Output() clear = new EventEmitter<void>();
@Output() search = new EventEmitter<SearchBarData>();
@Output() filtrosChange = new EventEmitter<SearchFilterDto>();
@Output() itemSelected = new EventEmitter<Item>();
@Output() itemDeleted = new EventEmitter<number>();
```

### 3.3 Uso en Template del Padre

```html
<app-mi-hijo
  [items]="itemsList"
  [isLoading]="loading"
  [mode]="'register'"
  (search)="onSearch($event)"
  (clear)="onClear()"
  (itemSelected)="onSelectItem($event)">
</app-mi-hijo>
```

---

## 4. Comentarios

**REGLA**: Comentar SOLO lo necesario. No documentar obviedades.

**✅ SI comentar**:
- Lógica compleja o no obvia
- Decisiones técnicas ("por qué")
- Workarounds o hacks por limitaciones
- Cases edge

**❌ NO comentar**:
- Declaración de variables
- Funciones cuyo nombre ya explica qué hacen
- Código autoexplicativo
- Imports

---

## 5. Más Info

Para formularios reactivos → skill("formularios")
Para estilos y diseño → skill("estilos")
Para servicios HTTP → skill("servicios")
Para patrones de componentes → skill("patrones")
