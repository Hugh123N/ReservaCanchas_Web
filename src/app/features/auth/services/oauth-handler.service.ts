import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap, finalize } from 'rxjs/operators';
import { UsersService } from './users.service';
import { AuthService } from '@core/auth/services/auth.service';
import { OAuthProvider, OAuthRegistryService } from './oauth';

/**
 * Callbacks para el manejo de autenticación OAuth.
 */
export interface OAuthCallbacks {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onFinally: () => void;
}

/**
 * Servicio que orquesta el flujo completo de autenticación OAuth.
 * Utiliza el patrón Strategy para soportar múltiples proveedores.
 *
 * @example
 * ```typescript
 * // Autenticar con cualquier proveedor
 * this.oauthHandler.authenticate(OAuthProvider.GOOGLE, {
 *   onSuccess: (msg) => this.successMessage = msg,
 *   onError: (msg) => this.errorMessage = msg,
 *   onFinally: () => this.isLoading = false
 * });
 *
 * // Obtener proveedores disponibles
 * const providers = this.oauthHandler.getAvailableProviders();
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class OAuthHandlerService {
  constructor(
    private registry: OAuthRegistryService,
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Ejecuta el flujo de autenticación OAuth para cualquier proveedor registrado.
   *
   * @param provider - Proveedor OAuth (Google, Facebook, etc.)
   * @param callbacks - Callbacks para manejar éxito, error y finalización
   */
  authenticate(provider: OAuthProvider, callbacks: OAuthCallbacks): void {
    const strategy = this.registry.getStrategy(provider);

    if (!strategy) {
      callbacks.onError(`Proveedor ${provider} no está disponible.`);
      callbacks.onFinally();
      return;
    }

    strategy.login().subscribe({
      next: (token: string) => {
        this.processOAuthToken(provider, token, strategy, callbacks);
      },
      error: () => {
        callbacks.onError(strategy.getErrorMessage('login'));
        callbacks.onFinally();
      }
    });
  }

  /**
   * Procesa el token obtenido del proveedor OAuth.
   * Envía al backend para validación y obtención del JWT de la app.
   */
  private processOAuthToken(
    provider: OAuthProvider,
    token: string,
    strategy: ReturnType<OAuthRegistryService['getStrategy']>,
    callbacks: OAuthCallbacks
  ): void {
    if (!strategy) return;

    this.usersService
      .loginWithOAuth(provider, token)
      .pipe(
        tap(async (response) => {
          if (response && response.isValid) {
            await this.authService.logIn(response.data.accessToken);
            callbacks.onSuccess(strategy.getSuccessMessage());

            setTimeout(() => {
              this.navigateAfterLogin();
            }, 1000);
          } else {
            const errorMsg = response?.Messages?.join(', ') || strategy.getErrorMessage('process');
            callbacks.onError(errorMsg);
          }
        }),
        finalize(() => callbacks.onFinally())
      )
      .subscribe({
        error: () => {
          callbacks.onError(strategy.getErrorMessage('process'));
          callbacks.onFinally();
        }
      });
  }

  /**
   * Navega al usuario después de un login exitoso.
   * Verifica si hay una URL de redirección guardada.
   */
  private navigateAfterLogin(): void {
    const redirectUrl = sessionStorage.getItem('redirect_after_login');
    if (redirectUrl) {
      sessionStorage.removeItem('redirect_after_login');
      this.router.navigateByUrl(redirectUrl);
    } else {
      this.router.navigate(['/']);
    }
  }

  /**
   * Obtiene la lista de proveedores OAuth disponibles.
   * Útil para renderizar botones dinámicamente.
   */
  getAvailableProviders(): OAuthProvider[] {
    return this.registry.getAvailableProviders();
  }

  /**
   * Verifica si un proveedor específico está disponible.
   */
  isProviderAvailable(provider: OAuthProvider): boolean {
    return this.registry.hasStrategy(provider);
  }

}
