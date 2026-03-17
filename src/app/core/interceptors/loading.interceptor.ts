import { HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * Token para deshabilitar el loading en peticiones específicas.
 */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

/**
 * Interceptor funcional que muestra/oculta el loading global automáticamente.
 *
 * - Muestra loading al iniciar cualquier petición HTTP
 * - Oculta loading cuando termina (éxito o error)
 * - Soporta múltiples peticiones simultáneas
 * - Permite deshabilitar loading por petición usando SKIP_LOADING
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Si la petición tiene SKIP_LOADING, no mostrar loading
  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};
