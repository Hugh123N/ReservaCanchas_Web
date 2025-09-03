export interface Disponibilidad {
  idCancha?: number;
  idDiaSemana: number;
  horaInicio: string; // TimeOnly en backend → string en Angular (HH:mm)
  horaFin: string;    // TimeOnly en backend → string en Angular (HH:mm)
  disponible?: boolean;
}