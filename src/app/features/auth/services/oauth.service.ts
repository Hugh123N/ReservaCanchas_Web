import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { environment } from '@environments/environment';

// Declaración de tipos globales de Google Sign-In y Facebook SDK
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: GoogleButtonConfig) => void;
          disableAutoSelect: () => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
    FB?: {
      init: (params: FacebookInitParams) => void;
      login: (callback: (response: FacebookLoginResponse) => void, options?: FacebookLoginOptions) => void;
      logout: (callback: () => void) => void;
      getLoginStatus: (callback: (response: FacebookLoginResponse) => void) => void;
    };
    fbAsyncInit?: () => void;
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
  credential: string; // JWT token
  select_by?: string;
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

@Injectable({
  providedIn: 'root'
})
export class OAuthService {

  private readonly GOOGLE_CLIENT_ID = '133409574804-gucuitfeqfj0lkceuaa1qcukcfoib8ib.apps.googleusercontent.com';
  private readonly FACEBOOK_APP_ID = '840348131695058';
  private googleInitialized = false;
  private facebookInitialized = false;

  constructor() { }

  initializeGoogleSignIn(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.googleInitialized) {
        resolve();
        return;
      }

      // Verificar si el script de Google ya está cargado
      if (typeof window.google !== 'undefined') {
        this.googleInitialized = true;
        resolve();
        return;
      }

      // Cargar el script de Google Sign-In dinámicamente
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.googleInitialized = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('No se pudo cargar el script de Google Sign-In'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Inicia el flujo de autenticación con Google usando One Tap
   * @returns Observable con el token de Google
   */
  loginWithGoogle(): Observable<string> {
    return from(
      new Promise<string>((resolve, reject) => {
        this.initializeGoogleSignIn()
          .then(() => {
            if (!window.google) {
              reject(new Error('Google Sign-In no está disponible'));
              return;
            }

            // Configurar Google Sign-In
            window.google.accounts.id.initialize({
              client_id: this.GOOGLE_CLIENT_ID,
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

            // Mostrar el prompt de Google One Tap
            window.google.accounts.id.prompt((notification: any) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Si no se muestra el prompt, mostrar error
                reject(new Error('Google Sign-In fue cerrado o no está disponible'));
              }
            });
          })
          .catch(error => {
            reject(error);
          });
      })
    );
  }

  /**
   * Renderiza un botón de Google Sign-In en un elemento HTML
   * @param element Elemento HTML donde renderizar el botón
   * @param callback Función que se ejecuta cuando el usuario inicia sesión
   * @param options Opciones de personalización del botón
   */
  renderGoogleButton(
    element: HTMLElement,
    callback: (token: string) => void,
    options?: GoogleButtonConfig
  ): void {
    this.initializeGoogleSignIn()
      .then(() => {
        if (!window.google) {
          console.error('Google Sign-In no está disponible');
          return;
        }

        // Configurar Google Sign-In
        window.google.accounts.id.initialize({
          client_id: this.GOOGLE_CLIENT_ID,
          callback: (response: GoogleCredentialResponse) => {
            if (response.credential) {
              callback(response.credential);
            }
          }
        });

        // Renderizar el botón
        const defaultOptions: GoogleButtonConfig = {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: element.offsetWidth || 300
        };

        window.google.accounts.id.renderButton(
          element,
          { ...defaultOptions, ...options }
        );
      })
      .catch(error => {
        console.error('Error al inicializar Google Sign-In:', error);
      });
  }

  /**
   * Cierra la sesión de Google
   */
  logoutGoogle(email: string): void {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.revoke(email, () => {
        console.log('Sesión de Google cerrada');
      });
    }
  }

  // ===== FACEBOOK OAUTH METHODS =====

  initializeFacebookSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.facebookInitialized) {
        resolve();
        return;
      }

      // Verificar si el SDK de Facebook ya está cargado
      if (typeof window.FB !== 'undefined') {
        this.facebookInitialized = true;
        resolve();
        return;
      }

      // Configurar callback de inicialización
      window.fbAsyncInit = () => {
        window.FB!.init({
          appId: this.FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        this.facebookInitialized = true;
        resolve();
      };

      // Cargar el script de Facebook SDK dinámicamente
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

  /**
   * Inicia el flujo de autenticación con Facebook
   * @returns Observable con el access token de Facebook
   */
  loginWithFacebook(): Observable<string> {
    return from(
      new Promise<string>((resolve, reject) => {
        this.initializeFacebookSDK()
          .then(() => {
            if (!window.FB) {
              reject(new Error('Facebook SDK no está disponible'));
              return;
            }

            // Solicitar login con permisos de email
            window.FB.login(
              (response: FacebookLoginResponse) => {
                if (response.status === 'connected' && response.authResponse) {
                  // Usuario autenticado exitosamente
                  resolve(response.authResponse.accessToken);
                } else {
                  // Usuario canceló el login o no autorizó
                  reject(new Error('Facebook login fue cancelado o no autorizado'));
                }
              },
              {
                scope: 'email,public_profile',
                return_scopes: true
              }
            );
          })
          .catch(error => {
            reject(error);
          });
      })
    );
  }

  logoutFacebook(): void {
    if (window.FB) {
      window.FB.logout(() => {
        console.log('Sesión de Facebook cerrada');
      });
    }
  }
}
