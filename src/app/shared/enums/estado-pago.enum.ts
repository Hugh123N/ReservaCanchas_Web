export enum EstadoPago {
  PENDIENTE = 'Pendiente',
  PARCIAL = 'Parcial',
  PAGADO = 'Pagado'
}

export const ESTADO_PAGO_META: Record<EstadoPago, { label: string; cssClass: string }> = {
  [EstadoPago.PAGADO]: { label: 'Pagado', cssClass: 'bg-green-100 text-green-800' },
  [EstadoPago.PARCIAL]: { label: 'Parcial', cssClass: 'bg-amber-100 text-amber-800' },
  [EstadoPago.PENDIENTE]: { label: 'Pendiente', cssClass: 'bg-neutral-100 text-neutral-800' }
};

export function getEstadoPagoMeta(estado: string) {
  return ESTADO_PAGO_META[estado as EstadoPago] || { label: estado, cssClass: 'bg-neutral-100 text-neutral-800' };
}
