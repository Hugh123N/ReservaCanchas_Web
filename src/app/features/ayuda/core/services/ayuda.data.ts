import {
  PreguntaFrecuente,
  PasoProceso,
  ContactInfo,
  AyudaAudience
} from '../models/pregunta.model';

export const AUDIENCIAS: AyudaAudience[] = [
  {
    id: 'cliente',
    etiqueta: 'Soy cliente',
    eyebrow: 'Para jugadores',
    subtitle: 'Encuentra respuestas sobre reservas, pagos y más.',
    sideLead: 'Respuestas claras y directas sobre reservas, pagos y cancelaciones.',
    stepsTitle: '¿Cómo funciona?',
    stepsSubtitle: 'Reservar una cancha es fácil, sigue estos pasos.',
    contactEyebrow: 'Soporte para jugadores',
    contactCopy: 'Estamos para ayudarte con tus reservas, pagos y cancelaciones. Cuéntanos qué necesitas y te respondemos lo antes posible.'
  },
  {
    id: 'dueno',
    etiqueta: 'Soy dueño de cancha',
    eyebrow: 'Para propietarios',
    subtitle: 'Todo lo que necesitas saber para publicar y gestionar tus canchas.',
    sideLead: 'Todo lo que necesitas para publicar tu cancha, recibir reservas y gestionar tu negocio.',
    stepsTitle: 'Empieza en 4 pasos',
    stepsSubtitle: 'De registrar tu complejo a recibir tus primeras reservas.',
    contactEyebrow: 'Soporte para propietarios',
    contactCopy: 'Nuestro equipo te acompaña para que tu complejo esté publicado y recibiendo reservas. Cuéntanos qué necesitas y te respondemos lo antes posible.'
  }
];

export const PASOS_CLIENTE: PasoProceso[] = [
  {
    numero: 1,
    titulo: 'Busca tu cancha',
    descripcion: 'Selecciona tu ciudad, tipo de deporte y fecha en el buscador.',
    icono: 'search'
  },
  {
    numero: 2,
    titulo: 'Elige horario',
    descripcion: 'En el detalle de la cancha, selecciona la fecha y las horas que deseas reservar.',
    icono: 'event'
  },
  {
    numero: 3,
    titulo: 'Confirma tu reserva',
    descripcion: 'Revisa el resumen y haz clic en "Crear Reserva". El método de pago es en efectivo.',
    icono: 'check_circle'
  },
  {
    numero: 4,
    titulo: 'Espera confirmación',
    descripcion: 'El operador de la cancha te contactará por WhatsApp para confirmar tu reserva.',
    icono: 'phone_in_talk'
  },
  {
    numero: 5,
    titulo: '¡Listo para jugar!',
    descripcion: 'Una vez confirmada, acude a tu cancha en el horario reservado.',
    icono: 'sports_soccer'
  }
];

export const PASOS_DUENO: PasoProceso[] = [
  {
    numero: 1,
    titulo: 'Crea tu cuenta',
    descripcion: 'Regístrate como proveedor en pocos minutos.',
    icono: 'how_to_reg'
  },
  {
    numero: 2,
    titulo: 'Registra tus canchas',
    descripcion: 'Agrega fotos, ubicación, horarios y precio por hora.',
    icono: 'business'
  },
  {
    numero: 3,
    titulo: 'Recibe reservas',
    descripcion: 'Los jugadores reservan y tú confirmas por WhatsApp.',
    icono: 'smartphone'
  },
  {
    numero: 4,
    titulo: 'Gestiona y crece',
    descripcion: 'Controla calendario, ingresos y ocupación desde tu panel.',
    icono: 'insights'
  }
];

export const PREGUNTAS_CLIENTE: PreguntaFrecuente[] = [
  {
    id: 1,
    categoria: 'Proceso de reserva',
    pregunta: '¿Cómo reservo una cancha?',
    respuesta: 'Busca tu cancha por ciudad, deporte y fecha. Selecciona el horario deseado, completa tu número de teléfono y haz clic en "Crear reserva". El operador te contactará por WhatsApp para confirmar.'
  },
  {
    id: 2,
    categoria: 'Proceso de reserva',
    pregunta: '¿Puedo reservar varias horas seguidas?',
    respuesta: 'Sí. En el detalle de la cancha puedes seleccionar varias horas consecutivas disponibles dentro de la misma reserva.'
  },
  {
    id: 3,
    categoria: 'Cuenta',
    pregunta: '¿Necesito crear cuenta para reservar?',
    respuesta: 'Para reservar solo necesitas indicar tu número de teléfono; el operador te contactará por WhatsApp para confirmar.'
  },
  {
    id: 4,
    categoria: 'Proceso de reserva',
    pregunta: '¿Puedo cambiar la fecha de mi reserva?',
    respuesta: 'Comunícate con el operador de la cancha por WhatsApp lo antes posible para coordinar el cambio, según la disponibilidad.'
  },
  {
    id: 5,
    categoria: 'Pago',
    pregunta: '¿Cómo pago mi reserva?',
    respuesta: 'El pago se realiza en efectivo, directamente en la cancha.'
  },
  {
    id: 6,
    categoria: 'Proceso de reserva',
    pregunta: '¿Cuándo se confirma mi reserva?',
    respuesta: 'Una vez creada, el operador de la cancha te contactará por WhatsApp para confirmarla.'
  },
  {
    id: 7,
    categoria: 'Proceso de reserva',
    pregunta: '¿Qué pasa si no me confirman la reserva?',
    respuesta: 'Escríbenos por WhatsApp o correo y te ayudamos a comunicarte con la cancha.'
  },
  {
    id: 8,
    categoria: 'Cancelación',
    pregunta: '¿Puedo cancelar mi reserva?',
    respuesta: 'Sí. Avisa al operador por WhatsApp lo antes posible para liberar el horario.'
  },
  {
    id: 9,
    categoria: 'Cancelación',
    pregunta: '¿Tengo reembolso si cancelo?',
    respuesta: 'Como el pago se hace en la cancha, no se realiza ningún cobro previo que reembolsar.'
  },
  {
    id: 10,
    categoria: 'Contacto',
    pregunta: '¿Cómo contacto al soporte de ReservaFast?',
    respuesta: 'Por WhatsApp al 965 147 445 o por correo a ayuda@reservafast.com.'
  }
];

export const PREGUNTAS_DUENO: PreguntaFrecuente[] = [
  {
    id: 11,
    categoria: 'Primeros pasos',
    pregunta: '¿Cómo registro mi cancha?',
    respuesta: 'Crea tu cuenta de proveedor, entra a la sección Canchas y completa los datos: nombre, deporte, ubicación, fotos, horarios y precio por hora.'
  },
  {
    id: 12,
    categoria: 'Primeros pasos',
    pregunta: '¿Puedo registrar varias canchas?',
    respuesta: 'Sí. Puedes agregar todas las canchas de tu complejo desde la sección Canchas y administrarlas por separado.'
  },
  {
    id: 13,
    categoria: 'Primeros pasos',
    pregunta: '¿Cómo defino mis horarios y precios?',
    respuesta: 'Al crear o editar una cancha configuras los horarios de atención y el precio por hora. Puedes actualizarlos cuando quieras.'
  },
  {
    id: 14,
    categoria: 'Reservas',
    pregunta: '¿Cómo recibo y confirmo reservas?',
    respuesta: 'Las nuevas reservas aparecen en la sección Reservas. Tú o tu operador contactan al cliente por WhatsApp para confirmar.'
  },
  {
    id: 15,
    categoria: 'Reservas',
    pregunta: '¿Dónde veo mis reservas por día?',
    respuesta: 'En Calendario ves las reservas organizadas por día y los horarios que siguen libres.'
  },
  {
    id: 16,
    categoria: 'Reservas',
    pregunta: '¿Qué hago si un cliente quiere cancelar o cambiar su reserva?',
    respuesta: 'Gestiónalo desde Reservas y coordina el cambio con el cliente por WhatsApp para liberar o reasignar el horario.'
  },
  {
    id: 17,
    categoria: 'Pagos',
    pregunta: '¿Cómo cobro las reservas?',
    respuesta: 'El cliente paga en efectivo directamente en tu cancha.'
  },
  {
    id: 18,
    categoria: 'Mi panel',
    pregunta: '¿Qué significan los números del Dashboard?',
    respuesta: 'Ingresos del mes y Reservas del mes resumen tu actividad; Reservas hoy muestra lo de hoy; la Tasa de ocupación es el porcentaje de horas reservadas frente a las disponibles.'
  },
  {
    id: 19,
    categoria: 'Equipo',
    pregunta: '¿Qué son los operadores?',
    respuesta: 'Son personas de tu equipo que gestionan las reservas por ti. Los agregas desde la sección Operadores.'
  },
  {
    id: 20,
    categoria: 'Mi panel',
    pregunta: '¿Cómo contacto al soporte?',
    respuesta: 'Por WhatsApp al 965 147 445 o por correo a ayuda@reservafast.com.'
  }
];

export const CONTACTO: ContactInfo = {
  whatsapp: '965 147 445',
  whatsappUrl: 'https://wa.me/51965147445',
  facebook: 'ReservaFast',
  facebookUrl: 'https://facebook.com/reservafast',
  email: 'ayuda@reservafast.com',
  emailUrl: 'mailto:ayuda@reservafast.com'
};

export const PANEL_PROVEEDOR_URL = 'https://gestion.reservafast.com/auth/login';

// Mensaje prellenado según la audiencia que escribe (wa.me?text=)
export const MENSAJES_WHATSAPP: Record<string, string> = {
  cliente: 'Hola, necesito ayuda con una reserva en ReservaFast',
  dueno: 'Hola, soy dueño de cancha y necesito ayuda con mi publicación en ReservaFast'
};

export const CATEGORIAS_CLIENTE = [
  'Proceso de reserva',
  'Cuenta',
  'Pago',
  'Cancelación',
  'Contacto'
];

export const CATEGORIAS_DUENO = [
  'Primeros pasos',
  'Reservas',
  'Pagos',
  'Mi panel',
  'Equipo'
];
