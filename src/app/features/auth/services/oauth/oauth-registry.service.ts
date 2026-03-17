import { Injectable } from '@angular/core';
import { OAuthProvider } from './oauth-provider.enum';
import { OAuthStrategy, GoogleOAuthStrategy, FacebookOAuthStrategy } from './strategies';

/**
 * Registry de estrategias OAuth.
 * Centraliza el acceso a todas las estrategias disponibles.
 *
 * Para agregar un nuevo proveedor:
 * 1. Crear la estrategia implementando OAuthStrategy
 * 2. Agregar al enum OAuthProvider
 * 3. Registrar en el constructor de este servicio
 *
 * @example
 * ```typescript
 * // Obtener una estrategia específica
 * const googleStrategy = this.registry.getStrategy(OAuthProvider.GOOGLE);
 *
 * // Obtener todos los proveedores disponibles
 * const providers = this.registry.getAvailableProviders();
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class OAuthRegistryService {
  private strategies = new Map<OAuthProvider, OAuthStrategy>();

  constructor() {
    // Registrar todas las estrategias disponibles
    this.registerStrategy(new GoogleOAuthStrategy());
    this.registerStrategy(new FacebookOAuthStrategy());

    // Agregar nuevas estrategias aquí:
    // this.registerStrategy(new AppleOAuthStrategy());
    // this.registerStrategy(new MicrosoftOAuthStrategy());
  }

  /**
   * Registra una nueva estrategia de OAuth.
   * @param strategy - Estrategia que implementa OAuthStrategy
   */
  registerStrategy(strategy: OAuthStrategy): void {
    this.strategies.set(strategy.provider, strategy);
  }

  /**
   * Obtiene la estrategia para un proveedor específico.
   * @param provider - Proveedor OAuth
   * @returns Estrategia del proveedor o undefined si no existe
   */
  getStrategy(provider: OAuthProvider): OAuthStrategy | undefined {
    return this.strategies.get(provider);
  }

  /**
   * Verifica si un proveedor está disponible.
   * @param provider - Proveedor OAuth
   */
  hasStrategy(provider: OAuthProvider): boolean {
    return this.strategies.has(provider);
  }

  /**
   * Obtiene la lista de proveedores disponibles.
   * @returns Array de OAuthProvider registrados
   */
  getAvailableProviders(): OAuthProvider[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Obtiene todas las estrategias registradas.
   * @returns Array de estrategias
   */
  getAllStrategies(): OAuthStrategy[] {
    return Array.from(this.strategies.values());
  }
}
