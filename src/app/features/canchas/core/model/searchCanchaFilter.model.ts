import { AreaGeografica } from './areaGeografica.model';

export interface SearchCanchaFilter {
  nombre?: string;
  codigoUbigeo?: string;
  idTipoDeporte?: number;
  fecha?: string;
  hora?: string;
  idEstadoCancha?: number;
  area?: AreaGeografica;
  idUsuario?: string;
  soloFavoritos?: boolean;
}