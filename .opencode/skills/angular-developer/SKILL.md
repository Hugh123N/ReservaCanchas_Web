---
name: angular-developer
description: Genera código Angular y ofrece guía arquitectónica. Trigger al crear proyectos, componentes, servicios, o para mejores prácticas de reactividad (signals, linkedSignal, resource), forms, DI, routing, SSR, ARIA, animaciones, estilos, testing o CLI.
---

# Angular Developer Guidelines

## Cuándo Activar

- Trabajar en cualquier proyecto Angular
- Crear o scaffolding de proyectos, componentes, servicios, directivas, pipes, guards, resolvers
- Implementar reactividad con Angular Signals, `linkedSignal`, o `resource`
- Trabajar con Angular forms (signal forms, reactive forms, template-driven)
- Configurar DI, routing, lazy loading, route guards
- Agregar ARIA, animaciones, estilos
- Escribir o depurar tests Angular
- Configurar Angular CLI o Angular MCP server

## Reglas

1. Siempre analizar la versión de Angular del proyecto antes de dar guía.
2. Seguir Angular style guide y mejores prácticas.
3. Al terminar de generar código, ejecutar `ng build` para verificar errores.

## Crear Proyectos Nuevos

1. Usar última versión estable de Angular.
2. Verificar si hay instalación local: `ng version`
3. Si no hay, usar: `npx @angular/cli@latest new <project-name>`

## Componentes

- **Fundamentals**: Anatomía, metadata, template control flow (`@if`, `@for`, `@switch`)
- **Inputs**: Signal-based inputs, transforms, model inputs
- **Outputs**: Signal-based outputs y custom events
- **Host Elements**: Host bindings e inyección de atributos

### Estructura de Componente

```typescript
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class MyComponent {
  // ✅ inject() para DI (NO constructor)
  private service = inject(MyService);

  // ✅ input() para inputs (NO @Input())
  itemId = input.required<string>();
  readonly = input(false);

  // ✅ output() para outputs (NO @Output())
  itemChange = output<Item>();

  // ✅ signal() para estado mutable
  loading = signal(false);
  items = signal<Item[]>([]);

  // ✅ computed() para estado derivado
  totalItems = computed(() => this.items().length);
}
```

## Reactivity - Signals

```typescript
// Signal básico
count = signal(0);
count.set(5);
count.update(n => n + 1);

// Computed (read-only derivado)
doubleCount = computed(() => this.count() * 2);

// linkedSignal (writable linked to source)
searchQuery = signal('');
linkedResults = linkedSignal(() => this.searchQuery());

// resource (async data into signals)
itemsResource = resource({
  request: () => this.itemId(),
  loader: async ({request: id}) => {
    return await firstValueFrom(this.service.getItems(id));
  }
});

// effect (side effects)
constructor() {
  effect(() => {
    console.log('Count changed:', this.count());
  });
}
```

## Dependency Injection

```typescript
// ✅ inject() function
private service = inject(MyService);
private router = inject(Router);

// ✅ Opcional
private optional = inject(OptionalService, { optional: true });

// ✅ InjectionToken
const API_URL = new InjectionToken<string>('API_URL');

// ✅ providedIn
@Injectable({ providedIn: 'root' })
export class MyService { }
```

## Routing

```typescript
// Lazy loading
const routes: Routes = [
  {
    path: 'feature',
    loadComponent: () => import('./feature/feature.component').then(m => m.FeatureComponent)
  }
];

// Functional guard
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? true : inject(Router).createUrlTree(['/login']);
};
```

## Forms

### Signal Forms (preferido para nuevos proyectos)
```typescript
// State management con signals
form = signal({ name: '', email: '' });
```

### Reactive Forms
```typescript
form = this.fb.group({
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]]
});
```

## Template Syntax

```html
<!-- ✅ Control flow moderno -->
@if (condition) { ... }
@for (item of items; track item.id) { ... }
@switch (value) { @case ('x') { ... } }

<!-- ❌ PROHIBIDO -->
<div *ngIf="condition">...</div>
<div *ngFor="let item of items">...</div>
```

## Class and Style Bindings

```html
<!-- ✅ Bindings directos -->
<div [class.active]="isActive" [class]="extraClasses">
<div [style.width]="width + 'px'">

<!-- ❌ PROHIBIDO -->
<div [ngClass]="{'active': isActive}">
<div [ngStyle]="{'width': width + 'px'}">
```

## Anti-Patterns

- Usar `null` o `undefined` como valores iniciales de signals → usar `''`, `0`, o `[]`
- Acceder a form field state sin llamar al field: `form.field.valid()` → `form.field().valid()`
- Usar `effect()` para estado derivado que debería usar `computed()`
- Referenciar `$parent.$index` en `@for` anidados
- Usar `*ngIf`, `*ngFor`, `*ngSwitch` → usar `@if`, `@for`, `@switch`
- Usar `@Input()` / `@Output()` decorators → usar `input()` / `output()`

## Testing

```typescript
 TestBed.configureTestingModule({
   imports: [MyComponent]
 });

 const fixture = TestBed.createComponent(MyComponent);
 expect(fixture.componentInstance.count()).toBe(0);
```

## Más Info

Para estilos del proyecto → skill("estilos")
Para Tailwind v4 → skill("tailwind-4-docs")
Para componentes del proyecto → skill("angular-core")
Para patrones de UI → skill("patrones")
