import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { OAuthStrategy } from './oauth-strategy.interface';
import { OAuthProvider } from '../oauth-provider.enum';

// Declaración de tipos globales de Google Sign-In
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void;
          prompt: (callback?: (notification: GooglePromptNotification) => void) => void;
          renderButton: (parent: HTMLElement, options: GoogleButtonConfig) => void;
          disableAutoSelect: () => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}

interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GooglePromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
}

/**
 * Estrategia OAuth para autenticación con Google.
 * Utiliza Google Identity Services (One Tap).
 */
@Injectable()
export class GoogleOAuthStrategy implements OAuthStrategy {
  readonly provider = OAuthProvider.GOOGLE;
  readonly providerName = 'Google';

  private readonly CLIENT_ID = '133409574804-gucuitfeqfj0lkceuaa1qcukcfoib8ib.apps.googleusercontent.com';
  private initialized = false;

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.initialized) {
        resolve();
        return;
      }

      if (typeof window.google !== 'undefined') {
        this.initialized = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.initialized = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('No se pudo cargar el script de Google Sign-In'));
      };

      document.head.appendChild(script);
    });
  }

  login(): Observable<string> {
    return from(
      new Promise<string>((resolve, reject) => {
        this.initialize()
          .then(() => {
            if (!window.google) {
              reject(new Error('Google Sign-In no está disponible'));
              return;
            }

            window.google.accounts.id.initialize({
              client_id: this.CLIENT_ID,
              callback: (response: GoogleCredentialResponse) => {
                if (response.credential) {
                  resolve(response.credential);
                } else {
                  reject(new Error('No se recibió credencial de Google'));
                }
              },
              auto_select: false,
              cancel_on_tap_outside: true
            });

            window.google.accounts.id.prompt((notification: GooglePromptNotification) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                reject(new Error('Google Sign-In fue cerrado o no está disponible'));
              }
            });
          })
          .catch(error => reject(error));
      })
    );
  }

  logout(email?: string): void {
    if (window.google && email) {
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.revoke(email, () => {
        console.log('Sesión de Google cerrada');
      });
    }
  }

  getSuccessMessage(): string {
    return '¡Autenticación exitosa con Google!';
  }

  getErrorMessage(context: 'init' | 'login' | 'process'): string {
    const messages: Record<string, string> = {
      init: 'Error al inicializar Google Sign-In.',
      login: 'Error al iniciar sesión con Google. Por favor intenta nuevamente.',
      process: 'Error al procesar la autenticación con Google. Por favor intenta nuevamente.'
    };
    return messages[context];
  }

  /**
   * Renderiza un botón de Google Sign-In personalizado.
   * Útil para UIs que necesitan el botón nativo de Google.
   */
  renderButton(
    element: HTMLElement,
    callback: (token: string) => void,
    options?: GoogleButtonConfig
  ): void {
    this.initialize()
      .then(() => {
        if (!window.google) {
          console.error('Google Sign-In no está disponible');
          return;
        }

        window.google.accounts.id.initialize({
          client_id: this.CLIENT_ID,
          callback: (response: GoogleCredentialResponse) => {
            if (response.credential) {
              callback(response.credential);
            }
          }
        });

        const defaultOptions: GoogleButtonConfig = {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: element.offsetWidth || 300
        };

        window.google.accounts.id.renderButton(element, { ...defaultOptions, ...options });
      })
      .catch(error => console.error('Error al inicializar Google Sign-In:', error));
  }
}
