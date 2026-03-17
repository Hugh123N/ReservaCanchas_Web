import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject } from 'rxjs';

/**
 * Servicio centralizado para manejo de loading global.
 *
 * Características:
 * - Contador de peticiones activas (maneja múltiples llamadas simultáneas)
 * - Bloquea toda la UI durante la carga
 * - Mensaje personalizable
 * - Integrado con HTTP Interceptor para loading automático
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeRequests = 0;
  private message$ = new BehaviorSubject<string>('Cargando...');

  /** Observable del mensaje actual */
  readonly loadingMessage$ = this.message$.asObservable();

  constructor(private spinner: NgxSpinnerService) {}

  /**
   * Muestra el loading global.
   * @param message Mensaje opcional a mostrar (default: 'Cargando...')
   */
  show(message: string = 'Cargando...'): void {
    this.activeRequests++;
    this.message$.next(message);

    if (this.activeRequests === 1) {
      this.spinner.show('global-loading', {
        type: 'ball-spin-fade',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.7)',
        color: '#ffffff',
        fullScreen: true
      });
    }
  }

  /**
   * Oculta el loading global.
   * Solo se oculta cuando todas las peticiones activas han terminado.
   */
  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);

    if (this.activeRequests === 0) {
      this.spinner.hide('global-loading');
      this.message$.next('Cargando...');
    }
  }

  /**
   * Fuerza ocultar el loading ignorando el contador.
   * Útil para casos de error crítico o timeout.
   */
  forceHide(): void {
    this.activeRequests = 0;
    this.spinner.hide('global-loading');
    this.message$.next('Cargando...');
  }

  /**
   * Actualiza el mensaje sin cambiar el estado del spinner.
   */
  setMessage(message: string): void {
    this.message$.next(message);
  }

  /**
   * Retorna si hay alguna petición activa.
   */
  isLoading(): boolean {
    return this.activeRequests > 0;
  }
}
