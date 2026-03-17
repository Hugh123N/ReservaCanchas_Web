import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional de Token (Angular 18+ compatible)
 * Agrega el header Authorization con el token JWT a todas las peticiones HTTP
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const isAuthenticated = authService.isAuthenticated();
  const token = authService.getToken();

  // Si está autenticado y tiene token, agregar header Authorization
  if (isAuthenticated && token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
