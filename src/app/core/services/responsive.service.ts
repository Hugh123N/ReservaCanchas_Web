import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

/**
 * Servicio centralizado para manejo de breakpoints responsive.
 *
 * Proporciona observables compartidos para detectar el tipo de dispositivo,
 * evitando duplicación de lógica en componentes.
 *
 */
@Injectable({ providedIn: 'root' })
export class ResponsiveService {

  /**
   * Observable que emite `true` cuando el dispositivo es móvil (handset).
   */
  readonly isHandset$: Observable<boolean>;

  /**
   * Observable que emite `true` cuando el dispositivo es tablet.
   */
  readonly isTablet$: Observable<boolean>;

  /**
   * Observable que emite `true` cuando el dispositivo es desktop.
   */
  readonly isDesktop$: Observable<boolean>;

  /**
   * Observable que emite `true` para dispositivos móviles O tablets.
   */
  readonly isMobileOrTablet$: Observable<boolean>;

  /**
   * Observable que emite `true` para tablets O desktop.
   * Útil para layouts que muestran contenido expandido.
   */
  readonly isTabletOrDesktop$: Observable<boolean>;

  /**
   * Observable que emite `true` para pantallas pequeñas (< 600px).
   * Equivalente a Tailwind `sm` breakpoint.
   */
  readonly isSmall$: Observable<boolean>;

  /**
   * Observable que emite `true` para pantallas medianas (600px - 960px).
   * Equivalente a Tailwind `md` breakpoint.
   */
  readonly isMedium$: Observable<boolean>;

  /**
   * Observable que emite `true` para pantallas grandes (960px - 1280px).
   * Equivalente a Tailwind `lg` breakpoint.
   */
  readonly isLarge$: Observable<boolean>;

  /**
   * Observable que emite `true` para pantallas extra grandes (> 1280px).
   * Equivalente a Tailwind `xl` breakpoint.
   */
  readonly isXLarge$: Observable<boolean>;

  constructor(private breakpointObserver: BreakpointObserver) {
    // Breakpoints de dispositivo
    this.isHandset$ = this.createBreakpointObservable(Breakpoints.Handset);
    this.isTablet$ = this.createBreakpointObservable(Breakpoints.Tablet);
    this.isDesktop$ = this.createBreakpointObservable([Breakpoints.Web, Breakpoints.XLarge]);

    // Breakpoints combinados
    this.isMobileOrTablet$ = this.createBreakpointObservable([
      Breakpoints.Handset,
      Breakpoints.Tablet
    ]);

    this.isTabletOrDesktop$ = this.createBreakpointObservable([
      Breakpoints.Tablet,
      Breakpoints.Web,
      Breakpoints.XLarge
    ]);

    // Breakpoints por tamaño (alineados con Tailwind)
    this.isSmall$ = this.createBreakpointObservable('(max-width: 599.98px)');
    this.isMedium$ = this.createBreakpointObservable('(min-width: 600px) and (max-width: 959.98px)');
    this.isLarge$ = this.createBreakpointObservable('(min-width: 960px) and (max-width: 1279.98px)');
    this.isXLarge$ = this.createBreakpointObservable('(min-width: 1280px)');
  }

  /**
   * Crea un observable compartido para un breakpoint específico.
   *
   * @param breakpoint - Breakpoint(s) de Angular CDK o media query personalizada
   * @returns Observable<boolean> que emite true cuando el breakpoint coincide
   */
  private createBreakpointObservable(breakpoint: string | string[]): Observable<boolean> {
    return this.breakpointObserver
      .observe(breakpoint)
      .pipe(
        map(result => result.matches),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  /**
   * Crea un observable para una media query personalizada.
   * Útil cuando necesitas un breakpoint específico que no está predefinido.
   *
   * @param query - Media query CSS (ej: '(max-width: 767.98px)')
   * @returns Observable<boolean> que emite true cuando la media query coincide
   */
  observe(query: string): Observable<boolean> {
    return this.createBreakpointObservable(query);
  }

  /**
   * Obtiene el valor actual del breakpoint de forma síncrona.
   * Útil cuando necesitas el valor inmediatamente sin suscribirte.
   *
   * @param breakpoint - Breakpoint a verificar
   * @returns boolean indicando si el breakpoint coincide actualmente
   *
   * @example
   * ```typescript
   * if (this.responsiveService.isBreakpointActive(Breakpoints.Handset)) {
   *   // Lógica para móvil
   * }
   * ```
   */
  isBreakpointActive(breakpoint: string | string[]): boolean {
    return this.breakpointObserver.isMatched(breakpoint);
  }

  /**
   * Verifica si actualmente es un dispositivo móvil (handset).
   * @returns boolean
   */
  isHandset(): boolean {
    return this.isBreakpointActive(Breakpoints.Handset);
  }

  /**
   * Verifica si actualmente es una tablet.
   * @returns boolean
   */
  isTablet(): boolean {
    return this.isBreakpointActive(Breakpoints.Tablet);
  }

  /**
   * Verifica si actualmente es desktop.
   * @returns boolean
   */
  isDesktop(): boolean {
    return this.isBreakpointActive([Breakpoints.Web, Breakpoints.XLarge]);
  }
}
