import { Cancha } from "./cancha.model";
import { UpdateDisponibilidad } from "./disponibilidad/updateDisponibilidad.model";
import { UpdateImagenCancha } from "./imagenCancha/updateImagenCancha.model";

export interface UpdateCancha extends Cancha {
  idCancha: number;
  imagenes?: UpdateImagenCancha[];
  disponibilidades: UpdateDisponibilidad[];
}