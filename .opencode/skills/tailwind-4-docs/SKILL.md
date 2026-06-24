---
name: tailwind-4-docs
description: Documentación de Tailwind CSS v4 - guía de uso, migración v3→v4, directivas @theme, @source, @utility
---

# Tailwind 4 Docs

## Overview

Guía completa de Tailwind CSS v4 con documentación local y orientación de workflows. Usar para responder preguntas de desarrollo, configuración, migración v3→v4, y selección de utilities/variants.

## Quick Start

1. Identificar el topic (utility, variant, config, migración, implementación)
2. Usar la guía de referencia a continuación
3. Para migración, consultar la sección de migración

## CSS-First Configuration (v4)

Tailwind v4 elimina `tailwind.config.js`. Toda la configuración es en CSS.

### @theme Directive - Design Tokens

```css
@theme {
  --color-primary: #9333EA;
  --color-secondary: #06B6D4;
  --color-accent: #F97316;
  
  --font-sans: 'Inter', sans-serif;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
}
```

### @theme inline Pattern

Para valores que no generan utilities:

```css
@theme inline {
  --color-primary: #9333EA;
}
```

### @source Directive - Content Detection

```css
@source "../src/**/*.html";
@source "../src/**/*.tsx";
```

### @utility Directive - Custom Utilities

```css
@utility scrollbar-hide {
  ::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
}
```

### @custom-variant Directive

```css
@custom-variant dark (&:where(.dark, .dark *));
```

## Directives Reference (v3 → v4)

| v3 | v4 |
|-----|-----|
| `@tailwind base` | `@import "tailwindcss"` |
| `@tailwind components` | `@import "tailwindcss"` |
| `@tailwind utilities` | `@import "tailwindcss"` |
| `tailwind.config.js` | CSS `@theme` |
| `content: [...]` | `@source` |
| `plugins: [...]` | `@plugin` |

## Import Syntax (v4)

```css
@import "tailwindcss";
@import "./custom.css";
```

## Breaking Changes from v3

1. **Import syntax**: `@tailwind` directives → `@import "tailwindcss"`
2. **Configuration**: `tailwind.config.js` → CSS `@theme`
3. **Content detection**: JS array → `@source` directive
4. **Plugin loading**: `require()` → `@plugin` directive
5. **Custom variants**: JS API → `@custom-variant` directive
6. **Custom utilities**: JS API → `@utility` directive

## Common Gotchas

1. **No duplicate @theme blocks**: Keep only one `@theme` block
2. **Use @theme inline** for values that shouldn't generate utilities
3. **@source for content**: Always specify content paths
4. **@plugin for plugins**: Use `@plugin` instead of JS require()
5. **@utility for custom utilities**: Use `@utility` instead of JS addUtilities()

## Migration Checklist

When upgrading from v3 to v4:

- [ ] Browser support and compatibility
- [ ] Tooling changes: `@tailwindcss/postcss`, `@tailwindcss/cli`, `@tailwindcss/vite`
- [ ] Import syntax: `@import "tailwindcss"` replaces `@tailwind` directives
- [ ] Utility renames/removals
- [ ] Prefix format and important modifier placement
- [ ] Changes to variants, transforms, and arbitrary value syntax
- [ ] Remove `tailwind.config.js`
- [ ] Convert `content` array to `@source` directive
- [ ] Convert `theme.extend` to `@theme` block
- [ ] Convert plugins to `@plugin` directive

## Vite Integration

```typescript
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

## References

- Docs: https://tailwindcss.com/docs
- Theme: https://tailwindcss.com/docs/theme
- Import: https://tailwindcss.com/docs/import
- Source: https://tailwindcss.com/docs/detecting-classes-in-source-files

## Más Info

Para estilos del proyecto → skill("estilos")
Para componentes → skill("angular-core")
