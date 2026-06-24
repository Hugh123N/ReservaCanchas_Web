---
name: estilos
description: Sistema de diseño - Tailwind CSS, clases predefinidas, responsive, Angular Material permitido
---

## 1. REGLA: Usar Siempre Estilos del styles.css

**NUNCA** crear estilos inline o en CSS del componente para elementos comunes. Usar las clases predefinidas.

---

## 2. REGLA: No usar Angular Material para formularios ni cards

**PROHIBIDO** usar Angular Material para:
- `mat-form-field`, `matInput`, `mat-select`, `mat-label` → Usar `<input class="input-base">`, `<select class="select-base">`
- `mat-card` → Usar `<div class="content-card">`
- `mat-checkbox`, `mat-radio` → Usar inputs HTML nativos con estilos Tailwind
- `mat-datepicker` → Usar `<input type="date">` o datepicker personalizado

**PERMITIDO** usar Angular Material para:
- `mat-icon` → Para iconos
- `mat-spinner` → Para loading
- `mat-dialog` → Para modales
- `mat-menu` → Para dropdowns
- `mat-toolbar` → Para headers
- `snackBar` → Para notificaciones toast

---

## 3. Botones

```html
<!-- Botones sólidos -->
<button class="btn-primary">Acción Principal</button>
<button class="btn-secondary">Acción Secundaria</button>
<button class="btn-accent">Acción Especial</button>

<!-- Botones outline -->
<button class="btn-outline-primary">Ver Detalle</button>
<button class="btn-outline-secondary">Cancelar</button>

<!-- Botones con icono -->
<button class="btn-primary">
  <mat-icon class="icon-sm">add</mat-icon>
  Crear Nuevo
</button>

<!-- Botones white -->
<button class="btn-white-primary">Opción Primaria</button>

<!-- Botón limpio -->
<button class="btn-clean-primary">Acción Limpia</button>
```

---

## 4. Inputs y Formularios

```html
<!-- Input estándar -->
<label class="form-label">
  Nombre <span class="form-label-required">*</span>
</label>
<input class="input-base" type="text" placeholder="Ingrese nombre" />
<p class="form-error">Mensaje de error</p>
<p class="form-helper">Texto de ayuda</p>

<!-- Input pequeño -->
<input class="input-sm" type="text" placeholder="Buscar..." />

<!-- Select -->
<select class="select-base">
  <option value="">Seleccione...</option>
</select>

<!-- Textarea -->
<textarea class="textarea-base" rows="4" placeholder="Descripción"></textarea>
```

---

## 5. Tarjetas y Contenedores

```html
<!-- Card de contenido -->
<div class="content-card">
  <h3 class="title-section">Título de Sección</h3>
</div>

<!-- Card con hover -->
<div class="content-card enhanced-card">
  <p>Card con efecto hover</p>
</div>

<!-- Cards de color -->
<div class="card-primary">Contenido primario</div>
<div class="card-secondary">Contenido secundario</div>

<!-- Layout de página -->
<div class="page-wrapper">
  <div class="page-container">
    <div class="section-container">
      <!-- Contenido principal -->
    </div>
  </div>
</div>
```

---

## 6. Textos y Títulos

```html
<h1 class="title-main text-primary-600">Título Principal</h1>
<h2 class="title-section text-neutral-800">Título de Sección</h2>

<p class="text-lg">Texto grande</p>
<p class="text-base">Texto base</p>
<p class="text-sm">Texto pequeño</p>

<span class="text-primary">Texto primario</span>
<span class="text-secondary">Texto secundario</span>
```

---

## 7. Iconos

```html
<mat-icon class="icon-sm">email</mat-icon>
<mat-icon class="icon-md">location_on</mat-icon>
<mat-icon class="icon-lg">event</mat-icon>
<mat-icon class="icon-2xl">dashboard</mat-icon>

<mat-icon class="icon-primary">star</mat-icon>
<mat-icon class="icon-secondary">info</mat-icon>
```

---

## 8. Estados Vacíos y Loading

```html
<!-- Empty State -->
<div class="empty-state">
  <mat-icon class="empty-state-icon">inbox</mat-icon>
  <h3 class="empty-state-title">No hay elementos</h3>
  <p class="empty-state-description">No se encontraron resultados.</p>
  <button class="btn-primary">Crear Nuevo</button>
</div>

<!-- Loading State -->
<div class="loading-state">
  <mat-spinner diameter="60" color="primary" class="loading-spinner"></mat-spinner>
  <p class="loading-text">Cargando datos...</p>
</div>
```

---

## 9. Estados de Reserva/Pago

```html
<span class="estado-pendiente">Pendiente</span>
<span class="estado-confirmado">Confirmado</span>
<span class="estado-cancelado">Cancelado</span>
<span class="estado-expirado">Expirado</span>

<span class="status-disponible">Disponible</span>
<span class="status-mantenimiento">Mantenimiento</span>
<span class="status-ocupado">Ocupado</span>
```

---

## 10. Grids Responsivos

```html
<div class="grid-responsive-2">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<div class="grid-responsive-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<div class="grid-responsive-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

---

## 11. Animaciones

```html
<div class="fade-in-up">Elemento con animación fade-in-up</div>
<div class="slide-in-up">Elemento con animación slide-in-up</div>
<div class="pulse-animation">Elemento con animación pulse</div>
<div class="float-animation">Elemento con animación float</div>
```

---

## 12. Scrollbars

```html
<div class="scrollbar-hide">Contenido scrollable sin barra</div>
<div class="scrollbar-thin">Contenido scrollable con barra delgada</div>
```

---

## 13. Tailwind Directo

Cuando se necesite estilos no cubiertos por las clases custom, usar Tailwind directamente:

```html
<div class="content-card p-6 flex items-center gap-4">
  <mat-icon class="icon-lg text-primary-500">event</mat-icon>
  <div class="flex-1">
    <h3 class="text-lg font-semibold text-neutral-800">Título</h3>
    <p class="text-sm text-neutral-600">Descripción</p>
  </div>
</div>
```

---

## 14. Más Info

Para componentes y directivas → skill("angular-core")
Para formularios → skill("formularios")
Para patrones de UI → skill("patrones")
