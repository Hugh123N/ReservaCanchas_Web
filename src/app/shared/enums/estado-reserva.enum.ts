/**
 * Enum para estados de reserva
 * Basado en los códigos del backend
 */
export enum EstadoReservaCodigo {
  PENDIENTE = '01',
  CONFIRMADO = '02',
  CANCELADO = '03',
  EXPIRADO = '04'
}

/**
 * Enum para nombres de estados de reserva
 */
export enum EstadoReservaNombre {
  PENDIENTE = 'Pendiente',
  CONFIRMADO = 'Confirmado',
  CANCELADO = 'Cancelado',
  EXPIRADO = 'Expirado'
}

/**
 * Mapa para convertir código a nombre
 */
export const ESTADO_RESERVA_MAP: Record<EstadoReservaCodigo, EstadoReservaNombre> = {
  [EstadoReservaCodigo.PENDIENTE]: EstadoReservaNombre.PENDIENTE,
  [EstadoReservaCodigo.CONFIRMADO]: EstadoReservaNombre.CONFIRMADO,
  [EstadoReservaCodigo.CANCELADO]: EstadoReservaNombre.CANCELADO,
  [EstadoReservaCodigo.EXPIRADO]: EstadoReservaNombre.EXPIRADO
};

/**
 * Función helper para obtener el nombre del estado desde el código
 */
export function getEstadoReservaNombre(codigo: string): string {
  return ESTADO_RESERVA_MAP[codigo as EstadoReservaCodigo] || 'Desconocido';
}

/**
 * Función helper para verificar si un código es válido
 */
export function esEstadoReservaValido(codigo: string): boolean {
  return Object.values(EstadoReservaCodigo).includes(codigo as EstadoReservaCodigo);
}
