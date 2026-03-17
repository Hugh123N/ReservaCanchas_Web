import { Observable } from 'rxjs';
import { OAuthProvider } from '../oauth-provider.enum';

/**
 * Interfaz que define el contrato para cualquier estrategia de OAuth.
 *
 * Para agregar un nuevo proveedor OAuth:
 * 1. Crear una clase que implemente esta interfaz
 * 2. Implementar todos los métodos requeridos
 * 3. Registrar la estrategia en OAuthRegistryService
 *
 * @example
 * ```typescript
 * export class AppleOAuthStrategy implements OAuthStrategy {
 *   readonly provider = OAuthProvider.APPLE;
 *   readonly providerName = 'Apple';
 *
 *   initialize(): Promise<void> { ... }
 *   login(): Observable<string> { ... }
 *   logout(): void { ... }
 *   getSuccessMessage(): string { ... }
 *   getErrorMessage(context: string): string { ... }
 * }
 * ```
 */
export interface OAuthStrategy {
  /**
   * Identificador único del proveedor
   */
  readonly provider: OAuthProvider;

  /**
   * Nombre legible del proveedor para mostrar en UI
   */
  readonly providerName: string;

  /**
   * Inicializa el SDK del proveedor.
   * Debe cargar scripts necesarios y configurar el cliente.
   */
  initialize(): Promise<void>;

  /**
   * Ejecuta el flujo de login/autenticación.
   * @returns Observable que emite el token/credential del proveedor
   */
  login(): Observable<string>;

  /**
   * Cierra la sesión con el proveedor (opcional).
   * Algunos proveedores requieren parámetros adicionales.
   */
  logout(params?: any): void;

  /**
   * Retorna el mensaje de éxito personalizado para este proveedor.
   */
  getSuccessMessage(): string;

  /**
   * Retorna el mensaje de error personalizado para este proveedor.
   * @param context - Contexto del error ('init', 'login', 'process')
   */
  getErrorMessage(context: 'init' | 'login' | 'process'): string;
}
