import { Cancha } from "./cancha.model";
import { GetCanchaFavorita } from "./canchaFaborita/getCanchaFaborita.model";
import { GetEstadoCancha } from "../../../cancha-estado/core/model/getEstadoCancha.model";
import { GetImagenCancha } from "./imagenCancha/getImagenCancha.model";
import { GetTipoDeporte } from "../../../cancha-tipo/core/model/getTipoDeporte.model";
import { Ubigeo } from "./ubigeo/ubigeo.model";

export interface SearchCancha extends Cancha {
  codigo: string;
  idCancha: number;
  urlImagen?: string;
  tipoDeportes?: GetTipoDeporte[];
  estadoCancha?: GetEstadoCancha;
  faboritos?: GetCanchaFavorita[];
  ubigeo?: Ubigeo;
}