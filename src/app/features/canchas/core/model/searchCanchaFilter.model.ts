import { AreaGeografica } from './areaGeografica.model';

export interface SearchCanchaFilter {
  nombre?: string;
  codigoDepartamento?: string;
  codigoProvincia?: string;
  codigoDistrito?: string;
  codigoUbigeo?: string;
  idTipoCancha?: number;
  fecha?: string;
  hora?: string;
  idEstadoCancha?: number;
  activo?: boolean;
  area?: AreaGeografica;
}