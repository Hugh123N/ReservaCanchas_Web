/**
 * Enum para estados de pago
 */
export enum EstadoPago {
  PENDIENTE = 'Pendiente',
  PARCIAL = 'Parcial',
  PAGADO = 'Pagado'
}

/**
 * Función helper para verificar si un estado de pago es válido
 */
export function esEstadoPagoValido(estado: string): boolean {
  return Object.values(EstadoPago).includes(estado as EstadoPago);
}

/**
 * Función helper para obtener el color asociado al estado de pago
 * Útil para badges/chips en la UI
 */
export function getEstadoPagoColor(estado: string): string {
  switch (estado) {
    case EstadoPago.PAGADO:
      return 'success'; // Verde
    case EstadoPago.PARCIAL:
      return 'warning'; // Amarillo
    case EstadoPago.PENDIENTE:
      return 'warn'; // Rojo
    default:
      return 'default';
  }
}
