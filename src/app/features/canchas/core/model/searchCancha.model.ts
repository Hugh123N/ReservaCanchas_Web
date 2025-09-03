import { Cancha } from "./cancha.model";
import { GetCanchaFavorita } from "./canchaFaborita/getCanchaFaborita.model";
import { GetEstadoCancha } from "./estadoCancha/getEstadoCancha.model";
import { GetImagenCancha } from "./imagenCancha/getImagenCancha.model";
import { GetTipoCancha } from "./tipoCancha/getTipoCancha.model";
import { Ubigeo } from "./ubigeo/ubigeo.model";

export interface SearchCancha extends Cancha {
  idCancha?: number;
  tipoCancha?: GetTipoCancha;
  imagenesCancha?: GetImagenCancha[];
  estadoCancha?: GetEstadoCancha;
  faboritos?: GetCanchaFavorita[];
  ubigeo?: Ubigeo;
  horariosDisponibles?: string[];
}