import { OAuthProviderConfig } from '../../types/oauth-provider-config.type';

/**
 * Enum de proveedores OAuth soportados.
 * Para agregar un nuevo proveedor:
 * 1. Agregar el valor al enum
 * 2. Crear la estrategia correspondiente implementando OAuthStrategy
 * 3. Registrar la estrategia en OAuthRegistryService
 */
export enum OAuthProvider {
  GOOGLE = 'Google',
  FACEBOOK = 'Facebook',
  // Agregar nuevos proveedores aquí:
  // APPLE = 'Apple',
  // MICROSOFT = 'Microsoft',
  // TWITTER = 'Twitter',
}

/**
 * Configuración de display para cada proveedor
 */
//TODO: AUN NO ESTA EN USO, USO PARA BOTONES DINAMICOS CON FOR EN LOGIN.
export const OAUTH_PROVIDER_CONFIG: Record<OAuthProvider, OAuthProviderConfig> = {
  [OAuthProvider.GOOGLE]: {
    name: 'Google',
    icon: 'google',
    color: '#DB4437',
    bgColor: '#fff',
    textColor: '#757575'
  },
  [OAuthProvider.FACEBOOK]: {
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    bgColor: '#1877F2',
    textColor: '#fff'
  },
  // Agregar configuración de nuevos proveedores aquí
};
