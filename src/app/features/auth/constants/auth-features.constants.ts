import { FeatureAuth } from '../types/featureAuth';

export const AUTH_FEATURES_LOGIN_REGISTER: FeatureAuth[] = [
  {
    icon: 'payment',
    title: 'Pago Seguro',
    description: 'Múltiples métodos de pago seguros y confiables'
  },
  {
    icon: 'support_agent',
    title: 'Soporte 24/7',
    description: 'Nuestro equipo está disponible para ayudarte'
  }
];

export const AUTH_FEATURES_FORGOT_PASSWORD: FeatureAuth[] = [
  {
    icon: 'lock_reset',
    title: 'Recuperación Segura',
    description: 'Proceso seguro y confiable para recuperar tu cuenta'
  },
  {
    icon: 'email',
    title: 'Correo Verificado',
    description: 'Te enviaremos un enlace de recuperación a tu email'
  }
];

export const AUTH_FEATURES_RESET_PASSWORD: FeatureAuth[] = [
  {
    icon: 'security',
    title: 'Contraseña Segura',
    description: 'Crea una contraseña fuerte para proteger tu cuenta'
  },
  {
    icon: 'verified_user',
    title: 'Protección Total',
    description: 'Tu información está siempre protegida'
  }
];
