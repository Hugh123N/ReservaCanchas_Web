---
name: estado
description: Manejo de estado - Signals de Angular, RxJS Subjects, almacenamiento local
---

## 1. Signals (Angular 17+)

```typescript
import { signal, computed, effect } from '@angular/core';

// Estado local con signals
private _items = signal<Item[]>([]);
private _loading = signal<boolean>(false);
private _selectedItem = signal<Item | null>(null);

// Signals de solo lectura (expuestos al template)
items = this._items.asReadonly();
loading = this._loading.asReadonly();
selectedItem = this._selectedItem.asReadonly();

// Computed signals (derivados)
totalItems = computed(() => this._items().length);
hasItems = computed(() => this._items().length > 0);

// Métodos para modificar estado
loadItems(newItems: Item[]): void {
  this._items.set(newItems);
}

addItem(item: Item): void {
  this._items.update(items => [...items, item]);
}

removeItem(id: number): void {
  this._items.update(items => items.filter(i => i.id !== id));
}

selectItem(item: Item): void {
  this._selectedItem.set(item);
}
```

---

## 2. Subjects (RxJS)

```typescript
import { Subject } from 'rxjs';

private unsubscribe = new Subject<void>();

// En suscripciones:
this.miService.getData()
  .pipe(takeUntil(this.unsubscribe))
  .subscribe({ /* ... */ });

// En ngOnDestroy:
ngOnDestroy(): void {
  this.unsubscribe.next();
  this.unsubscribe.complete();
}
```

---

## 3. Almacenamiento Local

```typescript
// Guardar draft de reserva
localStorage.setItem(`reserva_draft_${canchaId}`, JSON.stringify(draft));

// Recuperar draft
const draft = JSON.parse(localStorage.getItem(`reserva_draft_${canchaId}`) || 'null');

// Eliminar draft
localStorage.removeItem(`reserva_draft_${canchaId}`);

// Session storage (temporal)
sessionStorage.setItem('redirect_after_login', currentUrl);
const redirect = sessionStorage.getItem('redirect_after_login');
sessionStorage.removeItem('redirect_after_login');
```

---

## 4. Ejemplo en el Proyecto: CanchaFavoritaService

```typescript
// Signals para favoritos
private _favoritos = signal<Map<number, GetCanchaFavorita>>(new Map());
favoritos = this._favoritos.asReadonly();

// Toggle favorito
toggleFavorito(idCancha: number): void {
  if (this._favoritos().has(idCancha)) {
    this.eliminarFavorito(idCancha);
  } else {
    this.agregarFavorito(idCancha);
  }
}
```

---

## 5. Más Info

Para directivas y componentes → skill("angular-core")
Para servicios HTTP → skill("servicios")
Para patrones de UI → skill("patrones")
