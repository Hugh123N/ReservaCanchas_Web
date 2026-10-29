import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor funcional de Token (Angular 18+ compatible)
 * Agrega el header Authorization con el token JWT a todas las peticiones HTTP
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const token = authService.getToken();
  if (!token) return next(req);
  if (!authService.isAuthenticated()) { authService.logoutSession(); return next(req); }
  const loginRequest = /\/Usuario\/(login|client\/loginAndCreate)(?:[/?]|$)/i.test(req.url);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      // Una respuesta de un token anterior no debe cerrar una sesión que ya se renovó.
      if (error instanceof HttpErrorResponse && error.status === 401 && !loginRequest && authService.getToken() === token) authService.logoutSession();
      return throwError(() => error);
    })
  );
};
