import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { OAuthService } from './oauth.service';
import { UsersService } from './users.service';
import { AuthService } from '@core/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OAuthHandlerService {
  constructor(
    private oauthService: OAuthService,
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Handles Google OAuth login/register flow
   * @param onSuccess - Callback executed on successful authentication
   * @param onError - Callback executed on error
   * @param onFinally - Callback executed when operation completes (regardless of success/failure)
   */
  handleGoogleAuth(
    onSuccess: (message: string) => void,
    onError: (message: string) => void,
    onFinally: () => void
  ): void {
    this.oauthService.loginWithGoogle().subscribe({
      next: (credential: string) => {
        this.usersService
          .loginWithOAuth('Google', credential)
          .pipe(
            tap(async (response) => {
              if (response && response.isValid) {
                await this.authService.logIn(response.data.accessToken);
                onSuccess('¡Autenticación exitosa con Google!');

                setTimeout(() => {
                  this.navigateAfterLogin();
                }, 1000);
              } else {
                const errorMsg = response?.Messages?.join(', ') || 'Error al autenticar con Google';
                onError(errorMsg);
              }
            }),
            finalize(() => onFinally())
          )
          .subscribe({
            error: () => {
              onError('Error al procesar la autenticación con Google. Por favor intenta nuevamente.');
              onFinally();
            }
          });
      },
      error: () => {
        onError('Error al iniciar sesión con Google. Por favor intenta nuevamente.');
        onFinally();
      }
    });
  }

  /**
   * Handles Facebook OAuth login/register flow
   * @param onSuccess - Callback executed on successful authentication
   * @param onError - Callback executed on error
   * @param onFinally - Callback executed when operation completes (regardless of success/failure)
   */
  handleFacebookAuth(
    onSuccess: (message: string) => void,
    onError: (message: string) => void,
    onFinally: () => void
  ): void {
    this.oauthService.loginWithFacebook().subscribe({
      next: (accessToken: string) => {
        this.usersService
          .loginWithOAuth('Facebook', accessToken)
          .pipe(
            tap(async (response) => {
              if (response && response.isValid) {
                await this.authService.logIn(response.data.accessToken);
                onSuccess('¡Autenticación exitosa con Facebook!');

                setTimeout(() => {
                  this.navigateAfterLogin();
                }, 1000);
              } else {
                const errorMsg = response?.Messages?.join(', ') || 'Error al autenticar con Facebook';
                onError(errorMsg);
              }
            }),
            finalize(() => onFinally())
          )
          .subscribe({
            error: () => {
              onError('Error al procesar la autenticación con Facebook. Por favor intenta nuevamente.');
              onFinally();
            }
          });
      },
      error: () => {
        onError('Error al iniciar sesión con Facebook. Por favor intenta nuevamente.');
        onFinally();
      }
    });
  }

  /**
   * Navigates user after successful login
   * Checks for redirect URL in sessionStorage, otherwise goes to home
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
}
