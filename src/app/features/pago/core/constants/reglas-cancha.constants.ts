export interface ReglaCancha {
  titulo: string;
  texto: string;
}

/**
 * Reglas generales mostradas antes de crear la reserva.
 * Placeholder temporal: cada cancha podrá definir sus propias reglas
 * (reemplazar por las reglas traídas desde el backend por IdCancha).
 */
export const REGLAS_CANCHA_GENERALES: ReglaCancha[] = [
  {
    titulo: 'Puntualidad',
    texto: 'La reserva debe desarrollarse estrictamente dentro del horario contratado.'
  },
  {
    titulo: 'Pago',
    texto: 'Los clientes que reserven con el 50% del pago deben pagar el saldo restante previo a la reserva.'
  },
  {
    titulo: 'Permitido',
    texto: 'Solo se autoriza el ingreso de alimentos y snacks individuales pequeños.'
  },
  {
    titulo: 'Prohibido',
    texto: 'Está estrictamente prohibido traer paquetes de bebidas personales (aguas, gaseosas, bebidas energizantes o rehidratantes), así como bebidas alcohólicas.'
  },
  {
    titulo: 'Cuidado del campo',
    texto: 'Queda prohibido reventar piñatas, usar confeti/pica-pica, espuma, bengalas o cualquier elemento que dañe o ensucie el césped sintético.'
  },
  {
    titulo: 'Daños materiales',
    texto: 'Cualquier daño a las canchas, mallas, arcos o infraestructura deberá ser asumido económicamente por el titular de la reserva.'
  },
  {
    titulo: 'Objetos personales',
    texto: 'El centro no se hace responsable por la pérdida, robo u olvido de pertenencias en las instalaciones.'
  },
  {
    titulo: 'Cancelaciones y reprogramación',
    texto: 'Cualquier cancelación o reprogramación se debe hacer mínimo 24 horas antes del inicio de la reserva contratada.'
  },
  {
    titulo: 'Uso de imagen',
    texto: 'La empresa está autorizada a tomar fotos o hacer grabaciones de las personas que se encuentren en el local para fines publicitarios.'
  }
];
