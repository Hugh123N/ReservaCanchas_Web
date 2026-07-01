import { Cancha } from "./cancha.model";
import { GetCanchaFavorita } from "./canchaFaborita/getCanchaFaborita.model";
import { GetEstadoCancha } from "../../../cancha-estado/core/model/getEstadoCancha.model";
import { GetImagenCancha } from "./imagenCancha/getImagenCancha.model";
import { GetTipoDeporte } from "../../../cancha-tipo/core/model/getTipoDeporte.model";
import { Ubigeo } from "./ubigeo/ubigeo.model";
import { GetHorarioCancha } from "./horarioCancha/gethorarioCancha.model";

export interface GetCancha extends Cancha {
  idCancha: number;
  duracionPreReserva?: number;
  porcentajeAdelantoMinimo?: number;
  tiempoLimiteCancelacion?: number;
  imagenesCancha?: GetImagenCancha[];
  tipoDeportes?: GetTipoDeporte[];
  servicios?: GetServicio[];
  estadoCancha?: GetEstadoCancha;
  faboritos?: GetCanchaFavorita[];
  ubigeo?: Ubigeo;

  horariosDisponibles?: GetHorarioCancha[]; 
}

export interface GetServicio {
  idServicio: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
}