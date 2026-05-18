import { Cancha } from "./cancha.model";
import { GetCanchaFavorita } from "./canchaFaborita/getCanchaFaborita.model";
import { GetEstadoCancha } from "../../../cancha-estado/core/model/getEstadoCancha.model";
import { GetImagenCancha } from "./imagenCancha/getImagenCancha.model";
import { GetTipoDeporte } from "../../../cancha-tipo/core/model/getTipoDeporte.model";
import { Ubigeo } from "./ubigeo/ubigeo.model";

export interface GetCancha extends Cancha {
  idCancha: number;
  duracionPreReserva?: number;
  porcentajeAdelantoMinimo?: number;
  imagenesCancha?: GetImagenCancha[];
  horariosDisponibles?: string[]; // TODO: AQUI, VER SI SE DEJA ASÍ O SE CAMBIA A UN MODELO CON FECHA Y HORA
  tipoDeportes?: GetTipoDeporte[];
  estadoCancha?: GetEstadoCancha;
  faboritos?: GetCanchaFavorita[];
  ubigeo?: Ubigeo;
}