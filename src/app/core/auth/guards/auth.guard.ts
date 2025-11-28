import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard - Protege rutas que requieren autenticación
 *
 * Verifica si el usuario está autenticado (tiene token JWT válido).
 * No valida permisos ni roles - solo autenticación.
 *
 * @usage En routes: { path: 'ruta', component: Component, canActivate: [AuthGuard] }
 *
 * @behavior
 * - Si está autenticado: Permite acceso
 * - Si NO está autenticado: Redirige a /auth/login y guarda la URL destino
 * - Compatible con SSR: En servidor permite acceso (se re-valida en cliente)
 */
export const AuthGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // En SSR: Permitir acceso (se validará en el cliente)
  if (!isBrowser) {
    return true;
  }

  // Verificar autenticación
  if (authService.isAuthenticated()) {
    return true;
  }

  // No autenticado: Guardar URL destino para redirigir después del login
  const returnUrl = state.url;
  sessionStorage.setItem('redirect_after_login', returnUrl);

  // Redirigir a login
  router.navigate(['/401']);
  return false;
};
