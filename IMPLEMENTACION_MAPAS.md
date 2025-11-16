# Implementación de Mapas - Sistema de Reserva de Canchas

## Descripción General

Se ha implementado un sistema de mapas interactivo utilizando **Mapbox GL JS** para visualizar las canchas deportivas en un mapa, permitiendo a los usuarios explorar ubicaciones, ver detalles y navegar a canchas específicas.

---

## Arquitectura de la Implementación

### 1. Interfaces de Datos (`location.interface.ts`)

Ubicación: `src/app/shared/interfaces/location.interface.ts`

Define las estructuras de datos para el sistema de mapas:

#### Interfaces Principales:

- **UbicacionCancha**: Representa la ubicación de una cancha en el mapa
  - `id`: Identificador único
  - `nombre`: Nombre de la cancha
  - `direccion`: Dirección completa
  - `distrito` y `provincia`: Ubicación administrativa
  - `coordenadas`: Objeto con `lat` y `lng`
  - `precioDesde`: Precio mínimo por hora
  - `deportes`: Array de deportes disponibles
  - `imagenUrl`: URL de imagen opcional
  - `calificacion` y `totalResenas`: Información de valoraciones

- **LimitesMapa**: Define los límites geográficos del mapa
  - `norte`, `sur`, `este`, `oeste`: Coordenadas de los límites

- **UbicacionUsuario**: Ubicación del usuario actual
  - `lat`, `lng`: Coordenadas
  - `precision`: Precisión en metros (opcional)

- **ViewportMapa**: Estado actual de la vista del mapa
  - `centro`: Coordenadas del centro
  - `zoom`: Nivel de zoom
  - `limites`: Límites visibles (opcional)

- **BusquedaPorAreaRequest**: Parámetros para búsqueda por área
- **CanchasCercanasRequest**: Parámetros para búsqueda por proximidad

---

### 2. Servicio de Mapbox (`mapbox.service.ts`)

Ubicación: `src/app/core/services/mapbox.service.ts`

Servicio principal que gestiona todas las interacciones con Mapbox GL JS.

#### Características Implementadas:

**Inicialización del Mapa:**
```typescript
inicializarMapa(contenedor: string | HTMLElement, opciones: {
  centro: [number, number];
  zoom: number;
  estilo?: string;
}): mapboxgl.Map
```
- Crea una instancia del mapa
- Añade controles de navegación
- Añade control de geolocalización
- Estilo predeterminado: `mapbox://styles/mapbox/streets-v12`

**Gestión de Marcadores:**
- `agregarMarcadorCancha()`: Añade un marcador personalizado para una cancha
- `agregarMarcadoresCanchas()`: Añade múltiples marcadores
- `eliminarMarcadorCancha()`: Elimina un marcador específico
- `eliminarTodosMarcadoresCanchas()`: Limpia todos los marcadores

**Interactividad:**
- `resaltarMarcador()`: Resalta un marcador al pasar el mouse
- `quitarResaltadoMarcador()`: Quita el resaltado
- Callbacks personalizados para `click` y `hover` en marcadores

**Navegación:**
- `volarA()`: Animación de vuelo a una ubicación específica
- `ajustarLimitesACanchas()`: Ajusta el zoom para mostrar todas las canchas
- `establecerUbicacionUsuario()`: Muestra la ubicación del usuario

**Utilidades:**
- `obtenerLimitesActuales()`: Obtiene los límites visibles del mapa
- `obtenerViewportActual()`: Obtiene el estado completo del viewport
- `estaDentroLimitesActuales()`: Verifica si una coordenada es visible
- `redimensionar()`: Ajusta el tamaño del mapa
- `destruir()`: Limpia recursos al destruir el componente

---

### 3. Servicio de Geolocalización (`geolocation.service.ts`)

Ubicación: `src/app/core/services/geolocation.service.ts`

Gestiona la obtención de la ubicación del usuario y cálculos de distancia.

#### Métodos Principales:

**Obtención de Ubicación:**
```typescript
obtenerPosicionActual(opciones?: PositionOptions): Observable<UbicacionUsuario>
```
- Usa la API de Geolocation del navegador
- Retorna un Observable con la ubicación
- Manejo robusto de errores con mensajes amigables

**Cálculos de Distancia:**
```typescript
calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number
```
- Fórmula de Haversine para cálculo preciso
- Retorna distancia en kilómetros

**Utilidades:**
- `ordenarPorDistancia()`: Ordena ubicaciones por proximidad
- `filtrarPorRadio()`: Filtra ubicaciones dentro de un radio
- `formatearDistancia()`: Formatea distancia en km o metros

**Manejo de Errores:**
- Códigos de error estándar del navegador
- Mensajes amigables en español
- Interfaz `ErrorGeolocalizacion` con:
  - `codigo`: Código de error numérico
  - `mensaje`: Mensaje técnico
  - `mensajeAmigable`: Mensaje para el usuario

---

### 4. Componente Principal: Mapa de Canchas (`mapa-canchas.component.ts`)

Ubicación: `src/app/features/canchas/pages/mapa-canchas/mapa-canchas.component.ts`

Componente de página que integra el mapa con la interfaz de usuario.

#### Estructura:

**Signals de Estado:**
```typescript
estaCargando = signal(true);
estaCargandoUbicacion = signal(false);
canchas = signal<UbicacionCancha[]>([]);
canchasFiltradas = signal<UbicacionCancha[]>([]);
canchaResaltadaId = signal<number | null>(null);
consultaBusqueda = signal('');
mensajeError = signal<string | null>(null);
mostrarBuscarEnArea = signal(false);
```

**Ciclo de Vida:**
1. `ngOnInit()`: Carga datos iniciales y parámetros de ruta
2. `ngAfterViewInit()`: Inicializa el mapa Mapbox
3. `ngOnDestroy()`: Limpia recursos del mapa

**Funcionalidades Principales:**

- **Inicialización del Mapa**: Crea el mapa centrado en Lima, Perú
- **Geolocalización**: Solicita y muestra ubicación del usuario
- **Marcadores Interactivos**:
  - Click en marcador → muestra popup con detalles
  - Hover en marcador → resalta marcador y tarjeta
- **Búsqueda**: Filtrado en tiempo real por nombre, distrito o deporte
- **Búsqueda por Área**: Botón para buscar canchas en el área visible
- **Sincronización**: Hover en tarjeta resalta marcador en el mapa

**Datos Mock:**
Incluye 3 canchas de ejemplo para demostración:
- Complejo Deportivo Los Ángeles (San Miguel)
- Estadio Municipal (Miraflores)
- Cancha Sintética El Recreo (San Isidro)

---

### 5. Componente de Tarjeta de Cancha (`venue-map-card.component.ts`)

Ubicación: `src/app/features/canchas/components/venue-map-card/venue-map-card.component.ts`

Tarjeta compacta para mostrar información de canchas en el sidebar/bottom sheet.

#### Características:

**Inputs:**
- `venue`: Datos de la cancha
- `isHighlighted`: Estado de resaltado
- `distance`: Distancia opcional desde el usuario

**Outputs:**
- `cardHover`: Emite eventos de hover (true/false)
- `cardClick`: Emite la cancha clickeada

**Getters Computados:**
- `mostrarPrecio`: Formatea precio en soles peruanos
- `mostrarDeportes`: Muestra los primeros 3 deportes
- `tieneDeportesAdicionales`: Indica si hay más deportes
- `cantidadDeportesAdicionales`: Cuenta deportes ocultos
- `mostrarDistancia`: Formatea distancia (km o metros)
- `imagenCancha`: Retorna imagen o placeholder

**Interactividad:**
- Hover sobre tarjeta → resalta marcador en mapa
- Click en tarjeta → centra mapa en la cancha
- Botón "Ver Detalles" → navega a página de detalle

---

### 6. Componente de Popup de Marcador (`venue-marker-popup.component.ts`)

Ubicación: `src/app/features/canchas/components/venue-marker-popup/venue-marker-popup.component.ts`

Popup que aparece al hacer click en un marcador del mapa.

#### Características:

**Contenido Mostrado:**
- Nombre de la cancha
- Ubicación (distrito, provincia)
- Imagen (si está disponible)
- Precio desde
- Calificación con estrellas
- Total de reseñas
- Chips de deportes (máximo 2)

**Funcionalidad:**
- Botón "Ver Detalles" navega a `/cancha/:id`
- Diseño compacto optimizado para popup
- Uso de Angular Material (Card, Chips, Icons)

---

## Estilos y Diseño

### Diseño Responsivo:

**Desktop (>= 768px):**
- Mapa ocupa toda la pantalla
- Sidebar fijo a la izquierda (400px de ancho)
- Lista de canchas scrolleable

**Mobile (< 768px):**
- Mapa ocupa toda la pantalla
- Bottom sheet deslizable desde abajo
- Altura ajustable del sheet

### Colores y Tema:

- Colores primarios de Angular Material
- Marcadores personalizados con icono de ubicación
- Marcador de usuario: círculo azul (#4285F4)
- Hover effects con transiciones suaves
- Badges de distancia con fondo semi-transparente

---

## Rutas Configuradas

Archivo: `src/app/features/canchas/cancha.routes.ts`

```typescript
{
  path: 'mapas',
  loadComponent: () => import('./pages/mapa-canchas/mapa-canchas.component')
    .then(m => m.MapaCanchasComponent),
  title: 'Mapa de Canchas'
}
```

**URL de acceso:** `http://localhost:4200/canchas/mapas`

---

## Integración con Backend (Futuro)

Actualmente usa datos mock. Para integrar con el backend:

### Endpoints Necesarios:

1. **GET `/api/canchas/ubicaciones`**
   - Retorna array de `UbicacionCancha[]`
   - Incluye coordenadas, precios, deportes, etc.

2. **GET `/api/canchas/cercanas`**
   - Parámetros: `lat`, `lng`, `radio` (km)
   - Retorna canchas dentro del radio especificado

3. **GET `/api/canchas/por-area`**
   - Parámetros: `norte`, `sur`, `este`, `oeste`
   - Retorna canchas dentro del área visible del mapa

### Servicio a Crear:

```typescript
// src/app/features/canchas/services/cancha-ubicacion.service.ts

@Injectable({ providedIn: 'root' })
export class CanchaUbicacionService {

  obtenerTodasUbicaciones(): Observable<UbicacionCancha[]> {
    return this.http.get<UbicacionCancha[]>(`${this.baseUrl}/ubicaciones`);
  }

  obtenerCanchasCercanas(request: CanchasCercanasRequest): Observable<UbicacionCancha[]> {
    return this.http.post<UbicacionCancha[]>(`${this.baseUrl}/cercanas`, request);
  }

  obtenerCanchasPorArea(request: BusquedaPorAreaRequest): Observable<UbicacionCancha[]> {
    return this.http.post<UbicacionCancha[]>(`${this.baseUrl}/por-area`, request);
  }
}
```

---

## Dependencias Requeridas

### NPM Packages:

```json
{
  "mapbox-gl": "^3.x.x"
}
```

### Instalación:

```bash
npm install mapbox-gl
```

### Tipos TypeScript:

```bash
npm install --save-dev @types/mapbox-gl
```

---

## Configuración de Environment

### Archivo: `src/environments/environment.ts`

```typescript
export const environment = {
  // ... otras configuraciones
  mapbox: {
    accessToken: 'YOUR_MAPBOX_TOKEN_HERE'
  }
};
```

**⚠️ IMPORTANTE:** Debes reemplazar `'YOUR_MAPBOX_TOKEN_HERE'` con tu token real de Mapbox para que el mapa funcione.

### Archivo: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  // ... otras configuraciones
  mapbox: {
    accessToken: 'TU_TOKEN_DE_PRODUCCION_AQUI'
  }
};
```

**Recomendación:** Usa diferentes tokens para desarrollo y producción para mejor control y seguridad.

---

## Assets Requeridos

### Icono de Marcador:

**Ubicación:** `src/assets/images/marker-icon.png`

Se usa como icono personalizado para los marcadores de canchas en el mapa.

**Tamaño recomendado:** 32x32 píxeles

**Formato:** PNG con transparencia

### Imagen Placeholder:

**Ubicación:** `src/assets/images/default-field.png`

Imagen por defecto cuando una cancha no tiene imagen.

---

## Características Implementadas

✅ Mapa interactivo con Mapbox GL JS
✅ Marcadores personalizados para canchas
✅ Geolocalización del usuario
✅ Popups informativos en marcadores
✅ Sidebar/Bottom sheet con lista de canchas
✅ Búsqueda en tiempo real
✅ Búsqueda por área visible
✅ Sincronización entre mapa y lista (hover effects)
✅ Navegación a página de detalle
✅ Cálculo y visualización de distancias
✅ Diseño responsivo (desktop y mobile)
✅ Control de navegación y zoom
✅ Control de geolocalización integrado
✅ Ajuste automático de límites para mostrar todas las canchas
✅ Animaciones suaves de navegación

---

## Características Pendientes (Futuras Mejoras)

🔲 Integración con backend real
🔲 Clustering de marcadores cuando hay muchas canchas cercanas
🔲 Filtros avanzados (deporte, precio, calificación)
🔲 Rutas y direcciones desde ubicación del usuario
🔲 Heatmap de disponibilidad de canchas
🔲 Capas de tráfico y transporte público
🔲 Modo oscuro para el mapa
🔲 Guardado de búsquedas favoritas
🔲 Compartir ubicación de canchas

---

## Notas Técnicas

### Uso de Signals de Angular:

El componente usa Signals para un estado reactivo eficiente:
- Actualización automática de la UI cuando cambian los datos
- Mejor rendimiento que RxJS para estado local
- API más simple y clara

### Gestión de Memoria:

- El servicio `MapboxService` limpia recursos en `destruir()`
- El componente implementa `ngOnDestroy()` correctamente
- Los event listeners se eliminan al destruir el componente

### Control Flow Syntax Moderno:

Usa la nueva sintaxis de control de flujo de Angular:
```html
@if (condicion) {
  <div>Contenido</div>
}

@for (item of items; track item.id) {
  <div>{{ item.nombre }}</div>
}
```

### TypeScript Strict Mode:

Todo el código cumple con TypeScript strict mode:
- Null checks explícitos
- Tipos bien definidos
- No hay `any` implícitos

---

## Troubleshooting

### El mapa no se carga:

1. Verifica que el token de Mapbox esté configurado correctamente
2. Revisa la consola del navegador para errores
3. Verifica que mapbox-gl esté instalado: `npm list mapbox-gl`

### Error de CSP (Content Security Policy):

El error `Refused to connect to '.well-known/appspecific/com.chrome.devtools.json'` es solo de las Chrome DevTools y no afecta la funcionalidad. Puede ignorarse de forma segura.

### Marcadores no aparecen:

1. Verifica que las coordenadas sean válidas (lat/lng)
2. Revisa que el zoom del mapa sea apropiado
3. Usa `ajustarLimitesACanchas()` para ver todos los marcadores

### Geolocalización no funciona:

1. Verifica que el navegador tenga permisos de ubicación
2. HTTPS es requerido en producción para geolocalización
3. Algunos navegadores bloquean geolocalización en localhost

---

## Mantenimiento y Actualizaciones

### Actualizar Mapbox GL JS:

```bash
npm update mapbox-gl
```

Revisa los [changelog de Mapbox](https://github.com/mapbox/mapbox-gl-js/releases) para cambios importantes.

### Compatibilidad de Navegadores:

- Chrome/Edge: ✅ Totalmente compatible
- Firefox: ✅ Totalmente compatible
- Safari: ✅ Compatible (requiere iOS 11.3+)
- IE11: ❌ No soportado

---

## Recursos y Referencias

- [Documentación de Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Ejemplos de Mapbox](https://docs.mapbox.com/mapbox-gl-js/example/)
- [Angular Signals](https://angular.dev/guide/signals)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

---

## Contacto y Soporte

Para preguntas o problemas relacionados con la implementación de mapas, contacta al equipo de desarrollo.

**Versión del documento:** 1.0
**Última actualización:** Noviembre 2025
**Mantenido por:** Equipo de Desarrollo Frontend
