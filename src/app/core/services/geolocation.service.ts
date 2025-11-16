import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { UbicacionUsuario } from '../../shared/interfaces/location.interface';

/**
 * Tipos de error de geolocalización
 */
export interface ErrorGeolocalizacion {
  codigo: number;
  mensaje: string;
  mensajeAmigable: string;
}

/**
 * Servicio para manejar operaciones de geolocalización
 */
@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private readonly RADIO_TIERRA_KM = 6371;

  constructor() { }

  /**
   * Verifica si la geolocalización está soportada por el navegador
   */
  esGeolocalizacionSoportada(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Solicita la ubicación actual del usuario
   * @param opciones Opciones de geolocalización
   * @returns Observable con ubicación del usuario o error
   */
  obtenerPosicionActual(opciones?: PositionOptions): Observable<UbicacionUsuario> {
    return new Observable((observer: Observer<UbicacionUsuario>) => {
      if (!this.esGeolocalizacionSoportada()) {
        observer.error({
          codigo: 0,
          mensaje: 'Geolocalización no soportada',
          mensajeAmigable: 'Tu navegador no soporta geolocalización. Por favor, actualiza tu navegador o usa uno diferente.'
        } as ErrorGeolocalizacion);
        return;
      }

      const opcionesPorDefecto: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...opciones
      };

      navigator.geolocation.getCurrentPosition(
        (posicion: GeolocationPosition) => {
          const ubicacionUsuario: UbicacionUsuario = {
            lat: posicion.coords.latitude,
            lng: posicion.coords.longitude,
            precision: posicion.coords.accuracy
          };
          observer.next(ubicacionUsuario);
          observer.complete();
        },
        (error: GeolocationPositionError) => {
          observer.error(this.manejarErrorGeolocalizacion(error));
        },
        opcionesPorDefecto
      );
    });
  }

  /**
   * Observa la posición del usuario para actualizaciones continuas
   * @param opciones Opciones de geolocalización
   * @returns Observable con actualizaciones de ubicación del usuario
   */
  observarPosicion(opciones?: PositionOptions): Observable<UbicacionUsuario> {
    return new Observable((observer: Observer<UbicacionUsuario>) => {
      if (!this.esGeolocalizacionSoportada()) {
        observer.error({
          codigo: 0,
          mensaje: 'Geolocalización no soportada',
          mensajeAmigable: 'Tu navegador no soporta geolocalización.'
        } as ErrorGeolocalizacion);
        return;
      }

      const opcionesPorDefecto: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...opciones
      };

      const watchId = navigator.geolocation.watchPosition(
        (posicion: GeolocationPosition) => {
          const ubicacionUsuario: UbicacionUsuario = {
            lat: posicion.coords.latitude,
            lng: posicion.coords.longitude,
            precision: posicion.coords.accuracy
          };
          observer.next(ubicacionUsuario);
        },
        (error: GeolocationPositionError) => {
          observer.error(this.manejarErrorGeolocalizacion(error));
        },
        opcionesPorDefecto
      );

      // Función de limpieza
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    });
  }

  /**
   * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
   * @param lat1 Latitud del primer punto
   * @param lng1 Longitud del primer punto
   * @param lat2 Latitud del segundo punto
   * @param lng2 Longitud del segundo punto
   * @returns Distancia en kilómetros
   */
  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLat = this.aRadianes(lat2 - lat1);
    const dLng = this.aRadianes(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.aRadianes(lat1)) *
      Math.cos(this.aRadianes(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.RADIO_TIERRA_KM * c;
  }

  /**
   * Ordena ubicaciones por distancia desde un punto de referencia
   * @param ubicaciones Array de ubicaciones con coordenadas
   * @param desdeLat Latitud de referencia
   * @param desdeLng Longitud de referencia
   * @returns Array ordenado con propiedad de distancia agregada
   */
  ordenarPorDistancia<T extends { coordenadas: { lat: number; lng: number } }>(
    ubicaciones: T[],
    desdeLat: number,
    desdeLng: number
  ): (T & { distancia: number })[] {
    return ubicaciones
      .map(ubicacion => ({
        ...ubicacion,
        distancia: this.calcularDistancia(
          desdeLat,
          desdeLng,
          ubicacion.coordenadas.lat,
          ubicacion.coordenadas.lng
        )
      }))
      .sort((a, b) => a.distancia - b.distancia);
  }

  /**
   * Filtra ubicaciones dentro de un radio determinado
   * @param ubicaciones Array de ubicaciones
   * @param centroLat Latitud del centro
   * @param centroLng Longitud del centro
   * @param radioKm Radio en kilómetros
   * @returns Array filtrado de ubicaciones
   */
  filtrarPorRadio<T extends { coordenadas: { lat: number; lng: number } }>(
    ubicaciones: T[],
    centroLat: number,
    centroLng: number,
    radioKm: number
  ): T[] {
    return ubicaciones.filter(ubicacion => {
      const distancia = this.calcularDistancia(
        centroLat,
        centroLng,
        ubicacion.coordenadas.lat,
        ubicacion.coordenadas.lng
      );
      return distancia <= radioKm;
    });
  }

  /**
   * Formatea la distancia para mostrar
   * @param distanciaKm Distancia en kilómetros
   * @returns String formateado
   */
  formatearDistancia(distanciaKm: number): string {
    if (distanciaKm < 1) {
      return `${Math.round(distanciaKm * 1000)} m`;
    }
    return `${distanciaKm.toFixed(1)} km`;
  }

  /**
   * Convierte grados a radianes
   */
  private aRadianes(grados: number): number {
    return grados * (Math.PI / 180);
  }

  /**
   * Maneja errores de geolocalización con mensajes amigables
   */
  private manejarErrorGeolocalizacion(error: GeolocationPositionError): ErrorGeolocalizacion {
    let mensajeAmigable: string;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        mensajeAmigable = 'Has denegado el permiso de ubicación. Por favor, permite el acceso a tu ubicación en la configuración de tu navegador para ver canchas cercanas.';
        break;
      case error.POSITION_UNAVAILABLE:
        mensajeAmigable = 'No se pudo obtener tu ubicación. Por favor, verifica que los servicios de ubicación estén habilitados en tu dispositivo.';
        break;
      case error.TIMEOUT:
        mensajeAmigable = 'La solicitud de ubicación ha excedido el tiempo de espera. Por favor, intenta nuevamente.';
        break;
      default:
        mensajeAmigable = 'Ocurrió un error al obtener tu ubicación. Por favor, intenta nuevamente.';
    }

    return {
      codigo: error.code,
      mensaje: error.message,
      mensajeAmigable
    };
  }
}
