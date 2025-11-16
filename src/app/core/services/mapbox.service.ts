import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../environments/environment';
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
      Object.defineProperty(mapboxgl, 'accessToken', {
        value: environment.mapbox.accessToken,
        writable: true,
        configurable: true
      });
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

    // Crear elemento personalizado para el marcador
    const el = document.createElement('div');
    el.className = 'marcador-personalizado';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.backgroundImage = 'url(/assets/images/marker-icon.png)';
    el.style.backgroundSize = 'cover';
    el.style.cursor = 'pointer';
    el.style.transition = 'transform 0.2s ease';
    el.dataset['canchaId'] = cancha.id.toString();

    // Agregar efecto hover
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.2)';
      if (alPasarMouse) alPasarMouse(cancha, true);
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      if (alPasarMouse) alPasarMouse(cancha, false);
    });

    // Crear marcador
    const marcador = new mapboxgl.Marker(el)
      .setLngLat([cancha.coordenadas.lng, cancha.coordenadas.lat])
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
   * Resalta un marcador específico
   * @param canchaId ID de la cancha a resaltar
   */
  resaltarMarcador(canchaId: number): void {
    const marcador = this.marcadores.get(canchaId);
    if (marcador) {
      const el = marcador.getElement();
      el.style.transform = 'scale(1.3)';
      el.style.zIndex = '1000';
    }
  }

  /**
   * Quita el resaltado de un marcador
   * @param canchaId ID de la cancha
   */
  quitarResaltadoMarcador(canchaId: number): void {
    const marcador = this.marcadores.get(canchaId);
    if (marcador) {
      const el = marcador.getElement();
      el.style.transform = 'scale(1)';
      el.style.zIndex = '';
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

    // Crear marcador personalizado de ubicación del usuario
    const el = document.createElement('div');
    el.className = 'marcador-ubicacion-usuario';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#4285F4';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

    this.marcadorUbicacionUsuario = new mapboxgl.Marker(el)
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
      limites.extend([cancha.coordenadas.lng, cancha.coordenadas.lat]);
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
