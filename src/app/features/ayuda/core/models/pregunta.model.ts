export type Audiencia = 'cliente' | 'dueno';

export interface PreguntaFrecuente {
  id: number;
  categoria: string;
  pregunta: string;
  respuesta: string;
}

export interface PasoProceso {
  numero: number;
  titulo: string;
  descripcion: string;
  icono: string;
}

export interface ContactInfo {
  whatsapp: string;
  whatsappUrl: string;
  facebook: string;
  facebookUrl: string;
  email: string;
  emailUrl: string;
}

export interface AyudaAudience {
  id: Audiencia;
  etiqueta: string;
  eyebrow: string;
  subtitle: string;
  sideLead: string;
  stepsTitle: string;
  stepsSubtitle: string;
  contactEyebrow: string;
  contactCopy: string;
}
