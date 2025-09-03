import { Disponibilidad } from "./disponibilidad.model";

export interface SelectDisponibilidad extends Disponibilidad {
  idDisponibilidad?: number;
}

export interface SelectDisponibilidadFilter {
  fechaDesde?: string;   // DateTimeOffset en backend → string ISO en Angular
  fechaHasta?: string;   // DateTimeOffset en backend → string ISO en Angular
  idDisponibilidad?: number;
  activo?: boolean;
}