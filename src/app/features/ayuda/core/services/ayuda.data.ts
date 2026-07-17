import { PreguntaFrecuente, PasoProceso, ContactInfo } from '../models/pregunta.model';

export const PASOS_PROCESO: PasoProceso[] = [
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

export const PREGUNTAS_FRECUENTES: PreguntaFrecuente[] = [
  {
    id: 1,
    categoria: 'Proceso de Reserva',
    pregunta: '¿Cómo reservo una cancha?',
    respuesta: 'Busca tu cancha por ciudad, deporte y fecha. Selecciona el horario deseado, completa tu número de teléfono y haz clic en "Crear Reserva". El operador te contactará por WhatsApp para confirmar.'
  },
  {
    id: 2,
    categoria: 'Proceso de Reserva',
    pregunta: '¿Puedo reservar varias horas seguidas?',
    respuesta: 'Sí, puedes seleccionar múltiples slots de tiempo en la misma reserva. El precio total se calcula multiplicando el precio por hora por la cantidad de horas seleccionadas.'
  },
  {
    id: 3,
    categoria: 'Proceso de Reserva',
    pregunta: '¿Necesito crear cuenta para reservar?',
    respuesta: 'Sí, necesitas una cuenta para completar una reserva. Puedes registrarte con tu email o iniciar sesión con Google/Facebook. La búsqueda de canchas es pública sin necesidad de login.'
  },
  {
    id: 4,
    categoria: 'Proceso de Reserva',
    pregunta: '¿Puedo cambiar la fecha de mi reserva?',
    respuesta: 'Una vez creada la reserva, no es posible modificarla desde la plataforma. Si necesitas cambiar la fecha, contacta directamente al operador de la cancha por WhatsApp.'
  },
  {
    id: 5,
    categoria: 'Pago',
    pregunta: '¿Cómo pago mi reserva?',
    respuesta: 'El método de pago actual es en efectivo. El operador de la cancha coordina el cobro directamente contigo al confirmar la reserva.'
  },
  {
    id: 6,
    categoria: 'Pago',
    pregunta: '¿Cuándo se confirma mi reserva?',
    respuesta: 'Tu reserva queda en estado "Pendiente" hasta que el operador la confirme. Tienes un tiempo limitado (indicado en el detalle) para que el operador confirme. Si no se confirma a tiempo, la reserva expira automáticamente.'
  },
  {
    id: 7,
    categoria: 'Pago',
    pregunta: '¿Qué pasa si no me confirman la reserva?',
    respuesta: 'Si el operador no confirma antes de la fecha de expiración, tu reserva se cancela automáticamente y queda como "Expirada". No se realiza ningún cobro.'
  },
  {
    id: 8,
    categoria: 'Cancelación',
    pregunta: '¿Puedo cancelar mi reserva?',
    respuesta: 'Puedes cancelar tu reserva antes de que sea confirmada por el operador. Una vez confirmada, la política de cancelación depende de cada cancha (generalmente gratuita hasta ciertas horas antes).'
  },
  {
    id: 9,
    categoria: 'Cancelación',
    pregunta: '¿Tengo reembolso si cancelo?',
    respuesta: 'Si la reserva fue pagada y cancelas dentro de la política de la cancha, el reembolso se coordina directamente con el operador. Consulta las políticas de cancelación en el detalle de la cancha.'
  },
  {
    id: 10,
    categoria: 'Cuenta',
    pregunta: '¿Cómo me registro?',
    respuesta: 'Haz clic en "Registrarse" en la barra de navegación. Completa tus datos (nombre, email, teléfono, contraseña) y confirma tu cuenta. También puedes registrarte con Google o Facebook.'
  },
  {
    id: 11,
    categoria: 'Cuenta',
    pregunta: '¿Olvidé mi contraseña?',
    respuesta: 'En la página de login, haz clic en "¿Olvidaste tu contraseña?". Ingresa tu email y recibirás un enlace para restablecerla.'
  },
  {
    id: 12,
    categoria: 'Contacto',
    pregunta: '¿Cómo hablo con la cancha?',
    respuesta: 'Una vez creada la reserva, el operador de la cancha te contactará por WhatsApp al número que registraste. También puedes encontrar el teléfono de la cancha en su página de detalle.'
  },
  {
    id: 13,
    categoria: 'Contacto',
    pregunta: '¿Tienen atención al cliente?',
    respuesta: 'Sí, puedes contactarnos por WhatsApp al 965 147 445 o escribirnos a ayuda@reservafast.com. Estamos disponibles para ayudarte con cualquier consulta.'
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

export const CATEGORIAS = [
  'Proceso de Reserva',
  'Pago',
  'Cancelación',
  'Cuenta',
  'Contacto'
];
