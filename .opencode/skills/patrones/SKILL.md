---
name: patrones
description: Patrones reutilizables - páginas con loading/empty/data, dialogs, filtros, cards
---

## 1. Patrón: Página con Loading/Empty/Data

```html
<div class="page-wrapper">
  <div class="page-container">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="title-main text-primary-600">Título de Página</h1>
      <button class="btn-primary" (click)="onCreate()">
        <mat-icon class="icon-sm">add</mat-icon>
        Crear
      </button>
    </div>

    <!-- Loading -->
    @if (isLoading) {
      <div class="loading-state">
        <mat-spinner diameter="60" color="primary"></mat-spinner>
        <p class="loading-text">Cargando...</p>
      </div>
    }

    <!-- Empty -->
    @if (!isLoading && items.length === 0) {
      <div class="empty-state">
        <mat-icon class="empty-state-icon">inbox</mat-icon>
        <h3 class="empty-state-title">No hay elementos</h3>
        <p class="empty-state-description">Comience creando uno nuevo.</p>
      </div>
    }

    <!-- Data -->
    @if (!isLoading && items.length > 0) {
      <div class="grid-responsive-3">
        @for (item of items; track item.id) {
          <div class="content-card enhanced-card cursor-pointer" (click)="viewDetail(item)">
            <h3 class="title-section">{{ item.nombre }}</h3>
          </div>
        }
      </div>
    }
  </div>
</div>
```

---

## 2. Patrón: Formulario en Dialog

```typescript
@Component({
  selector: 'app-mi-dialog',
  standalone: true,
  imports: [/* Material imports */],
  template: `
    <h2 mat-dialog-title>Título del Formulario</h2>
    <mat-dialog-content>
      <form [formGroup]="miFormulario">
        <div class="mb-4">
          <label class="form-label">Nombre <span class="form-label-required">*</span></label>
          <input class="input-base" formControlName="nombre" />
          <app-form-error [control]="miFormulario.get('nombre')"></app-form-error>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button class="btn-outline-primary" mat-dialog-close>Cancelar</button>
      <button class="btn-primary" (click)="onSave()" [disabled]="miFormulario.invalid">Guardar</button>
    </mat-dialog-actions>
  `
})
export class MiDialogComponent {
  miFormulario: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MiDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MiModel
  ) {
    this.miFormulario = this.fb.group({
      nombre: [data?.nombre || '', Validators.required]
    });
  }

  onSave(): void {
    if (this.miFormulario.valid) {
      this.dialogRef.close(this.miFormulario.value);
    }
  }
}
```

---

## 3. Patrón: Filtros Reutilizables

```typescript
@Component({
  selector: 'app-mi-filtros',
  standalone: true,
  imports: [/* ... */],
  template: `
    <form [formGroup]="filtrosForm" class="content-card p-4">
      <div class="grid-responsive-3">
        <div>
          <label class="form-label">Buscar</label>
          <input class="input-base" formControlName="buscar" placeholder="Nombre..." />
        </div>

        <div>
          <label class="form-label">Estado</label>
          <select class="select-base" formControlName="estado">
            <option [value]="null">Todos</option>
            @for (estado of estados; track estado.value) {
              <option [value]="estado.value">{{ estado.label }}</option>
            }
          </select>
        </div>

        <div class="flex items-end gap-2">
          <button class="btn-primary" (click)="onBuscar()">
            <mat-icon class="icon-sm">search</mat-icon>
            Buscar
          </button>
          <button class="btn-outline-secondary" (click)="onLimpiar()">Limpiar</button>
        </div>
      </div>
    </form>
  `
})
export class MiFiltrosComponent {
  @Input() filtrosActivos: MiFilterDto = {};
  @Output() filtrosChange = new EventEmitter<MiFilterDto>();
  @Output() limpiarFiltros = new EventEmitter<void>();

  filtrosForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filtrosForm = this.fb.group({
      buscar: [this.filtrosActivos.buscar || ''],
      estado: [this.filtrosActivos.estado || null]
    });
  }

  onBuscar(): void {
    this.filtrosChange.emit(this.filtrosForm.value);
  }

  onLimpiar(): void {
    this.filtrosForm.reset({ buscar: '', estado: null });
    this.limpiarFiltros.emit();
  }
}
```

---

## 4. Archivos de Referencia

| Patrón | Archivo de Referencia |
|--------|----------------------|
| Página con Loading/Empty/Data | `src/app/features/mis-reservas/components/lista-reservas/` |
| Formulario con validaciones | `src/app/features/auth/pages/register/` |
| Filtros reutilizables | `src/app/features/mis-reservas/components/filtros-reservas/` |
| Dialog con formulario | `src/app/features/mis-reservas/components/detalle-reserva/` |
| Card con hover | `src/app/features/canchas/components/card-cancha/` |
| Búsqueda con autocomplete | `src/app/shared/components/search-bar/` |
| Mensajes de error/éxito | `src/app/features/auth/components/auth-message/` |

---

## 5. Más Info

Para directivas y componentes → skill("angular-core")
Para formularios → skill("formularios")
Para estilos → skill("estilos")
