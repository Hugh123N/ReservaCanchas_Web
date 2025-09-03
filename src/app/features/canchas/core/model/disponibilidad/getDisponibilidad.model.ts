import { Disponibilidad } from "./disponibilidad.model";

export interface GetDisponibilidad extends Disponibilidad {
  idDisponibilidad: number;
  activo: boolean;
}