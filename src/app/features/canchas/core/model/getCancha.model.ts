import { Cancha } from "./cancha.model";
import { GetCanchaFavorita } from "./canchaFaborita/getCanchaFaborita.model";
import { GetEstadoCancha } from "../../../cancha-estado/core/model/getEstadoCancha.model";
import { GetImagenCancha } from "./imagenCancha/getImagenCancha.model";
import { GetTipoCancha } from "../../../cancha-tipo/core/model/getTipoCancha.model";
import { Ubigeo } from "./ubigeo/ubigeo.model";

export interface GetCancha extends Cancha {
  idCancha: number;
  tipoCancha?: GetTipoCancha;
  imagenesCancha?: GetImagenCancha[];
  estadoCancha?: GetEstadoCancha;
  faboritos?: GetCanchaFavorita[];
  ubigeo?: Ubigeo;
  horariosDisponibles?: string[];
}