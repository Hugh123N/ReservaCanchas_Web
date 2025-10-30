export interface Reserva {
  idUsuario: string;          
  idCancha: number;
  fecha: string;
  monto?: number | null;
  horaInicio: string;
  horaFin: string;
  idEstadoReserva: number;    
}