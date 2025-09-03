import { Cancha } from "./cancha.model";
import { GetCanchaFavorita } from "./canchaFaborita/getCanchaFaborita.model";
import { GetEstadoCancha } from "./estadoCancha/getEstadoCancha.model";
import { GetImagenCancha } from "./imagenCancha/getImagenCancha.model";
import { GetTipoCancha } from "./tipoCancha/getTipoCancha.model";
import { Ubigeo } from "./ubigeo/ubigeo.model";

export interface GetCancha extends Cancha {
  idCancha: number;
  activo: boolean;
  tipoCancha?: GetTipoCancha;
  imagenesCancha?: GetImagenCancha[];
  estadoCancha?: GetEstadoCancha;
  faboritos?: GetCanchaFavorita[];
  ubigeo?: Ubigeo;
  disponibilidad?: string[];
}