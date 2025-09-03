import { Cancha } from "./cancha.model";
import { CreateDisponibilidad } from "./disponibilidad/createDisponibilidad.model";
import { CreateImagenCancha } from "./imagenCancha/createImagenCancha.model";

export interface CreateCancha extends Cancha {
  imagenes?: CreateImagenCancha[];
  disponibilidades: CreateDisponibilidad[];
}