export interface Reserva {
  idUsuario: string;
  idCancha: number;
  fecha: string;
  monto?: number | null;
  idEstadoReserva: number;
}