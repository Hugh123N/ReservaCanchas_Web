import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  // URLs que NO deben mostrar el loader (peticiones silenciosas)
  private readonly SILENT_URLS = [
    '/auth/renew',
    '/auth/keep-alive'
  ];

  constructor(
    private router: Router,
    private ngxUiLoaderService: NgxUiLoaderService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const isSilentUrl = this.isSilentUrl(request.url);
    const isAuthenticated = this.authService.isAuthenticated();

    // Clonar request y agregar token si está autenticado
    let clonedRequest = request;
    if (isAuthenticated) {
      clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.authService.getToken()}`
        }
      });
    }

    // Mostrar loader solo si no es una petición silenciosa
    if (!isSilentUrl) {
      this.ngxUiLoaderService.start();
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      finalize(() => {
        if (!isSilentUrl) {
          this.ngxUiLoaderService.stop();
        }
      })
    );
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    // 401/403: No autorizado - Redirect a página 401
    if (error.status === 401 || error.status === 403) {
      this.handleUnauthorized();
      return throwError(() => error);
    }

    // 500+: Error del servidor - Redirect a página de error
    if (error.status >= 500) {
      this.handleServerError(error);
      return throwError(() => error);
    }

    // 404: Recurso no encontrado - Solo mostrar toast
    if (error.status === 404) {
      this.showToast(this.humanMessage(error), 'warning');
      return throwError(() => error);
    }

    // 0: Error de red/conexión - Mostrar toast
    if (error.status === 0) {
      this.showToast(this.humanMessage(error), 'error');
      return throwError(() => error);
    }

    // Otros errores - Toast genérico
    this.showToast(this.humanMessage(error), 'error');
    return throwError(() => error);
  }

  /**
   * Manejo de errores 401/403: Redirect a página 401 (sin logout)
   */
  private handleUnauthorized(): void {
    this.router.navigate(['/401']);
  }

  /**
   * Manejo de errores 500+: Redirect a página de error
   */
  private handleServerError(error: HttpErrorResponse): void {
    this.showToast(this.humanMessage(error), 'error');
    this.router.navigate(['/500']);
  }

  /**
   * Verificar si la URL es silenciosa (no debe mostrar loader)
   */
  private isSilentUrl(url: string): boolean {
    return this.SILENT_URLS.some(silentUrl => url.includes(silentUrl));
  }

  /**
   * Mostrar toast/snackbar con mensaje
   */
  private showToast(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    const panelClass = `snackbar-${type}`;
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  /**
   * Generar mensajes amigables para el usuario
   */
  private humanMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return "No hay conexión con el servidor o la red fue interrumpida.";
    }
    if (err.status >= 500) {
      return "Error del servidor. Intenta nuevamente más tarde.";
    }
    if (err.status === 404) {
      return "Recurso no encontrado.";
    }
    if (err.status === 401 || err.status === 403) {
      return "No autorizado o acceso denegado.";
    }
    return err.error?.message || err.message || "Ocurrió un error en la solicitud.";
  }
}
