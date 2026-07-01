export enum EstadoReservaCodigo {
  PENDIENTE = '01',
  CONFIRMADO = '02',
  CANCELADO = '03',
  EXPIRADO = '04'
}

export enum EstadoReservaNombre {
  PENDIENTE = 'Pendiente',
  CONFIRMADO = 'Confirmado',
  CANCELADO = 'Cancelado',
  EXPIRADO = 'Expirado'
}

export const ESTADO_RESERVA_MAP: Record<EstadoReservaCodigo, EstadoReservaNombre> = {
  [EstadoReservaCodigo.PENDIENTE]: EstadoReservaNombre.PENDIENTE,
  [EstadoReservaCodigo.CONFIRMADO]: EstadoReservaNombre.CONFIRMADO,
  [EstadoReservaCodigo.CANCELADO]: EstadoReservaNombre.CANCELADO,
  [EstadoReservaCodigo.EXPIRADO]: EstadoReservaNombre.EXPIRADO
};

export const ESTADO_RESERVA_META: Record<EstadoReservaCodigo, { label: string; cssClass: string; icon: string }> = {
  [EstadoReservaCodigo.PENDIENTE]: { label: 'Pendiente', cssClass: 'estado-pendiente', icon: 'schedule' },
  [EstadoReservaCodigo.CONFIRMADO]: { label: 'Confirmado', cssClass: 'estado-confirmado', icon: 'check_circle' },
  [EstadoReservaCodigo.CANCELADO]: { label: 'Cancelado', cssClass: 'estado-cancelado', icon: 'cancel' },
  [EstadoReservaCodigo.EXPIRADO]: { label: 'Expirado', cssClass: 'estado-expirado', icon: 'event_busy' }
};

export function getEstadoReservaNombre(codigo: string): string {
  return ESTADO_RESERVA_MAP[codigo as EstadoReservaCodigo] || 'Desconocido';
}

export function getEstadoReservaMeta(codigo: string) {
  return ESTADO_RESERVA_META[codigo as EstadoReservaCodigo] || { label: 'Desconocido', cssClass: '', icon: 'help' };
}
