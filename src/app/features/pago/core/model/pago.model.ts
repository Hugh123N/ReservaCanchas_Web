export interface Pago {
  idReserva?: number | null;
  idPlan?: number | null;
  moneda: string;
  codigoOperacion?: string | null;
  monto: number;
  montoAdelanto?: number | null;
  montoPendiente?: number | null;
  numeroReferencia?: string | null;
  idMetodoPago?: number | null;
  idEstadoPago: number;
}