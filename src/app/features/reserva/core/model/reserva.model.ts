export interface Reserva {
  idCliente: number;
  idCancha: number;
  idTipoDeporte: number;
  fechaReserva: string;
  montoTotal?: number | null;
  
}