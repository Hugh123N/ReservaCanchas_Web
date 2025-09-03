import { ImagenCancha } from "./imagenCancha.model";

export interface GetImagenCancha extends ImagenCancha {
  idImagenCancha: number;
  activo: boolean;
}