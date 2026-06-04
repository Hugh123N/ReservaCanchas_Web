import { Injectable } from '@angular/core';
//import * as mapboxgl from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';
import { environment } from '@environments/environment';
import { UbicacionCancha, LimitesMapa, ViewportMapa } from '../../shared/interfaces/location.interface';

/**
 * Servicio para administrar instancias de mapas Mapbox GL JS e interacciones
 */
@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  private mapa: mapboxgl.Map | null = null;
  private marcadores: Map<number, mapboxgl.Marker> = new Map();
  private marcadorUbicacionUsuario: mapboxgl.Marker | null = null;

  constructor() {
    // Inicializar token de acceso de Mapbox
    if (environment.mapbox?.accessToken) {
      (mapboxgl as any).accessToken = environment.mapbox.accessToken;
    }
  }

  /**
   * Inicializa una nueva instancia del mapa
   * @param contenedor Elemento HTML o ID que contendrá el mapa
   * @param opciones Opciones de inicialización del mapa
   * @returns Instancia del mapa Mapbox
   */
  inicializarMapa(
    contenedor: string | HTMLElement,
    opciones: {
      centro: [number, number];
      zoom: number;
      estilo?: string;
    }
  ): mapboxgl.Map {
    const opcionesMapa: mapboxgl.MapboxOptions = {
      container: contenedor,
      style: opciones.estilo || 'mapbox://styles/mapbox/streets-v12',
      center: opciones.centro,
      zoom: opciones.zoom,
      attributionControl: true,
      logoPosition: 'bottom-left'
    };

    this.mapa = new mapboxgl.Map(opcionesMapa);

    // Agregar controles de navegación
    this.mapa.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Agregar control de geolocalización
    this.mapa.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    return this.mapa;
  }

  /**
   * Obtiene la instancia actual del mapa
   */
  obtenerMapa(): mapboxgl.Map | null {
    return this.mapa;
  }

  /**
   * Agrega un marcador para una cancha
   * @param cancha Datos de ubicación de la cancha
   * @param alHacerClick Callback para click en marcador
   * @param alPasarMouse Callback para hover en marcador
   */
  agregarMarcadorCancha(
    cancha: UbicacionCancha,
    alHacerClick?: (cancha: UbicacionCancha) => void,
    alPasarMouse?: (cancha: UbicacionCancha, estaPasandoMouse: boolean) => void
  ): mapboxgl.Marker {
    if (!this.mapa) {
      throw new Error('Mapa no inicializado');
    }

    // Crear elemento personalizado para el marcador usando SVG
    const el = document.createElement('div');
    el.className = 'marcador-personalizado';
    el.style.width = '40px';
    el.style.height = '50px';
    el.dataset['canchaId'] = cancha.id.toString();

    // Crear SVG del marcador usando las variables CSS del proyecto
    el.innerHTML = `
      <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow-${cancha.id}" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        <!-- Pin principal -->
        <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 35 15 35s15-26.716 15-35c0-8.284-6.716-15-15-15z"
              fill="var(--color-primary-500)"
              filter="url(#shadow-${cancha.id})"/>
        <!-- Círculo interior blanco -->
        <circle cx="20" cy="15" r="6" fill="white"/>
        <!-- Icono de cancha -->
        <path d="M20 11.5c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5 3.5-1.567 3.5-3.5-1.567-3.5-3.5-3.5zm0 5.5c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z"
              fill="var(--color-primary-500)"/>
      </svg>
    `;

    // Agregar efecto hover usando clases CSS
    el.addEventListener('mouseenter', () => {
      el.classList.add('marcador-hover');
      if (alPasarMouse) alPasarMouse(cancha, true);
    });

    el.addEventListener('mouseleave', () => {
      el.classList.remove('marcador-hover');
      if (alPasarMouse) alPasarMouse(cancha, false);
    });

    // Crear marcador con punto de anclaje en la punta del pin
    const marcador = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom' // Anclar en la punta del pin (parte inferior)
    })
      .setLngLat([cancha.lng, cancha.lat])
      .addTo(this.mapa);

    // Agregar manejador de click
    if (alHacerClick) {
      el.addEventListener('click', () => alHacerClick(cancha));
    }

    // Guardar referencia del marcador
    this.marcadores.set(cancha.id, marcador);

    return marcador;
  }

  /**
   * Agrega marcadores para múltiples canchas
   * @param canchas Array de ubicaciones de canchas
   * @param alHacerClick Callback para click en marcador
   * @param alPasarMouse Callback para hover en marcador
   */
  agregarMarcadoresCanchas(
    canchas: UbicacionCancha[],
    alHacerClick?: (cancha: UbicacionCancha) => void,
    alPasarMouse?: (cancha: UbicacionCancha, estaPasandoMouse: boolean) => void
  ): void {
    canchas.forEach(cancha => {
      this.agregarMarcadorCancha(cancha, alHacerClick, alPasarMouse);
    });
  }

  /**
   * Elimina un marcador específico de cancha
   * @param canchaId ID de la cancha
   */
  eliminarMarcadorCancha(canchaId: number): void {
    const marcador = this.marcadores.get(canchaId);
    if (marcador) {
      marcador.remove();
      this.marcadores.delete(canchaId);
    }
  }

  /**
   * Elimina todos los marcadores de canchas
   */
  eliminarTodosMarcadoresCanchas(): void {
    this.marcadores.forEach(marcador => marcador.remove());
    this.marcadores.clear();
  }

  /**
   * Resalta un marcador específico agregando clase CSS directamente
   * @param canchaId ID de la cancha a resaltar
   */
  resaltarMarcador(canchaId: number): void {
    const marcador = this.marcadores.get(canchaId);
    if (marcador) {
      const el = marcador.getElement();
      // Agregar clase directamente en lugar de simular evento
      // Esto evita que Mapbox GL JS recalcule la posición del marcador
      el.classList.add('marcador-hover');
    }
  }

  /**
   * Quita el resaltado de un marcador removiendo clase CSS directamente
   * @param canchaId ID de la cancha
   */
  quitarResaltadoMarcador(canchaId: number): void {
    const marcador = this.marcadores.get(canchaId);
    if (marcador) {
      const el = marcador.getElement();
      // Remover clase directamente
      el.classList.remove('marcador-hover');
    }
  }

  /**
   * Agrega o actualiza el marcador de ubicación del usuario
   * @param lat Latitud
   * @param lng Longitud
   */
  establecerUbicacionUsuario(lat: number, lng: number): void {
    if (!this.mapa) return;

    // Eliminar marcador existente si lo hay
    if (this.marcadorUbicacionUsuario) {
      this.marcadorUbicacionUsuario.remove();
    }

    // Crear marcador personalizado de ubicación del usuario usando SVG
    const el = document.createElement('div');
    el.className = 'marcador-ubicacion-usuario';
    el.style.cursor = 'default';

    // SVG del marcador de usuario (punto azul con anillo pulsante)
    el.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow-user" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.4"/>
          </filter>
        </defs>
        <!-- Anillo exterior pulsante -->
        <circle cx="12" cy="12" r="10" fill="var(--color-secondary-500)" opacity="0.2">
          <animate attributeName="r" values="8;11;8" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
        </circle>
        <!-- Círculo principal -->
        <circle cx="12" cy="12" r="6" fill="var(--color-secondary-500)" filter="url(#shadow-user)"/>
        <!-- Borde blanco -->
        <circle cx="12" cy="12" r="6" fill="none" stroke="white" stroke-width="2"/>
      </svg>
    `;

    this.marcadorUbicacionUsuario = new mapboxgl.Marker({
      element: el,
      anchor: 'center' // Centrar el marcador en las coordenadas
    })
      .setLngLat([lng, lat])
      .addTo(this.mapa);
  }

  /**
   * Ajusta el mapa para mostrar todas las canchas
   * @param canchas Array de ubicaciones de canchas
   * @param relleno Relleno alrededor de los límites
   */
  ajustarLimitesACanchas(canchas: UbicacionCancha[], relleno: number = 50): void {
    if (!this.mapa || canchas.length === 0) return;

    const limites = new mapboxgl.LngLatBounds();

    canchas.forEach(cancha => {
      limites.extend([cancha.lng, cancha.lat]);
    });

    this.mapa.fitBounds(limites, {
      padding: relleno,
      maxZoom: 15
    });
  }

  /**
   * Vuela a una ubicación específica
   * @param lat Latitud
   * @param lng Longitud
   * @param zoom Nivel de zoom
   */
  volarA(lat: number, lng: number, zoom: number = 15): void {
    if (!this.mapa) return;

    this.mapa.flyTo({
      center: [lng, lat],
      zoom,
      essential: true
    });
  }

  /**
   * Obtiene los límites actuales del mapa
   */
  obtenerLimitesActuales(): LimitesMapa | null {
    if (!this.mapa) return null;

    const limites = this.mapa.getBounds();
    if (!limites) return null;

    return {
      norte: limites.getNorth(),
      sur: limites.getSouth(),
      este: limites.getEast(),
      oeste: limites.getWest()
    };
  }

  /**
   * Obtiene el viewport actual del mapa
   */
  obtenerViewportActual(): ViewportMapa | null {
    if (!this.mapa) return null;

    const centro = this.mapa.getCenter();
    return {
      centro: {
        lat: centro.lat,
        lng: centro.lng
      },
      zoom: this.mapa.getZoom(),
      limites: this.obtenerLimitesActuales() || undefined
    };
  }

  /**
   * Verifica si una coordenada está dentro de los límites actuales del mapa
   * @param lat Latitud
   * @param lng Longitud
   */
  estaDentroLimitesActuales(lat: number, lng: number): boolean {
    if (!this.mapa) return false;

    const limites = this.mapa.getBounds();
    if (!limites) return false;

    return limites.contains([lng, lat]);
  }

  /**
   * Agrega un listener de eventos al mapa
   * @param evento Nombre del evento
   * @param callback Manejador del evento
   */
  enEventoMapa(evento: string, callback: (e: any) => void): void {
    if (!this.mapa) return;
    this.mapa.on(evento as any, callback);
  }

  /**
   * Elimina un listener de eventos del mapa
   * @param evento Nombre del evento
   * @param callback Manejador del evento
   */
  quitarEventoMapa(evento: string, callback: (e: any) => void): void {
    if (!this.mapa) return;
    this.mapa.off(evento as any, callback);
  }

  /**
   * Redimensiona el mapa (útil cuando cambia el tamaño del contenedor)
   */
  redimensionar(): void {
    if (this.mapa) {
      this.mapa.resize();
    }
  }

  /**
   * Limpia los recursos del mapa
   */
  destruir(): void {
    if (this.marcadorUbicacionUsuario) {
      this.marcadorUbicacionUsuario.remove();
      this.marcadorUbicacionUsuario = null;
    }

    this.eliminarTodosMarcadoresCanchas();

    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }
  }
}
