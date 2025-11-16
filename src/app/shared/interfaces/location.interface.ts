/**
 * Interfaces relacionadas con ubicación y funcionalidad de mapas
 */

/**
 * Representa una cancha deportiva con datos de ubicación para mostrar en el mapa
 */
export interface UbicacionCancha {
  id: number;
  nombre: string;
  direccion: string;
  distrito: string;
  provincia: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  precioDesde: number;
  deportes: string[];
  imagenUrl?: string;
  calificacion?: number;
  totalResenas?: number;
}

/**
 * Límites del mapa para control del viewport
 */
export interface LimitesMapa {
  norte: number;
  sur: number;
  este: number;
  oeste: number;
}

/**
 * Ubicación actual del usuario con precisión
 */
export interface UbicacionUsuario {
  lat: number;
  lng: number;
  precision?: number;
}

/**
 * Configuración de agrupación de marcadores en el mapa
 */
export interface ConfiguracionClusterMarcadores {
  radio: number;
  zoomMaximo: number;
  zoomMinimo: number;
}

/**
 * Estado del viewport del mapa
 */
export interface ViewportMapa {
  centro: {
    lat: number;
    lng: number;
  };
  zoom: number;
  limites?: LimitesMapa;
}

/**
 * Request para búsqueda de canchas por área del mapa
 */
export interface BusquedaPorAreaRequest {
  limites: LimitesMapa;
  filtros?: {
    deporteId?: number;
    precioMin?: number;
    precioMax?: number;
    fechaReserva?: string;
  };
}

/**
 * Request para búsqueda de canchas cercanas a una ubicación
 */
export interface CanchasCercanasRequest {
  ubicacion: {
    lat: number;
    lng: number;
  };
  radioKm?: number; // Por defecto 5km
  filtros?: {
    deporteId?: number;
    precioMin?: number;
    precioMax?: number;
    fechaReserva?: string;
  };
}
