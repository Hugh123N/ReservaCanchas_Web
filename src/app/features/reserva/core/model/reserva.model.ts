export interface Reserva {
  idCliente: string;
  idCancha: number;
  idTipoDeporte: number;
  fechaReserva: string;
  montoTotal?: number | null;
  
}