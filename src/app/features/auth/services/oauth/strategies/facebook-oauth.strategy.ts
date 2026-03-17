import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { OAuthStrategy } from './oauth-strategy.interface';
import { OAuthProvider } from '../oauth-provider.enum';

// Declaración de tipos globales de Facebook SDK
declare global {
  interface Window {
    FB?: {
      init: (params: FacebookInitParams) => void;
      login: (callback: (response: FacebookLoginResponse) => void, options?: FacebookLoginOptions) => void;
      logout: (callback: () => void) => void;
      getLoginStatus: (callback: (response: FacebookLoginResponse) => void) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface FacebookInitParams {
  appId: string;
  cookie?: boolean;
  xfbml?: boolean;
  version: string;
}

interface FacebookLoginOptions {
  scope?: string;
  return_scopes?: boolean;
  auth_type?: string;
}

interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
  };
}

/**
 * Estrategia OAuth para autenticación con Facebook.
 * Utiliza Facebook JavaScript SDK.
 */
@Injectable()
export class FacebookOAuthStrategy implements OAuthStrategy {
  readonly provider = OAuthProvider.FACEBOOK;
  readonly providerName = 'Facebook';

  private readonly APP_ID = '840348131695058';
  private initialized = false;

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.initialized) {
        resolve();
        return;
      }

      if (typeof window.FB !== 'undefined') {
        this.initialized = true;
        resolve();
        return;
      }

      window.fbAsyncInit = () => {
        window.FB!.init({
          appId: this.APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        this.initialized = true;
        resolve();
      };

      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/es_ES/sdk.js';
      script.async = true;
      script.defer = true;

      script.onerror = () => {
        reject(new Error('No se pudo cargar el script de Facebook SDK'));
      };

      document.body.appendChild(script);
    });
  }

  login(): Observable<string> {
    return from(
      new Promise<string>((resolve, reject) => {
        this.initialize()
          .then(() => {
            if (!window.FB) {
              reject(new Error('Facebook SDK no está disponible'));
              return;
            }

            window.FB.login(
              (response: FacebookLoginResponse) => {
                if (response.status === 'connected' && response.authResponse) {
                  resolve(response.authResponse.accessToken);
                } else {
                  reject(new Error('Facebook login fue cancelado o no autorizado'));
                }
              },
              {
                scope: 'email,public_profile',
                return_scopes: true
              }
            );
          })
          .catch(error => reject(error));
      })
    );
  }

  logout(): void {
    if (window.FB) {
      window.FB.logout(() => {
        console.log('Sesión de Facebook cerrada');
      });
    }
  }

  getSuccessMessage(): string {
    return '¡Autenticación exitosa con Facebook!';
  }

  getErrorMessage(context: 'init' | 'login' | 'process'): string {
    const messages: Record<string, string> = {
      init: 'Error al inicializar Facebook SDK.',
      login: 'Error al iniciar sesión con Facebook. Por favor intenta nuevamente.',
      process: 'Error al procesar la autenticación con Facebook. Por favor intenta nuevamente.'
    };
    return messages[context];
  }
}
