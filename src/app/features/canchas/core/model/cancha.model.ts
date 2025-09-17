export interface Cancha {
  nombre: string;
  idTipoCancha: number;
  descripcion?: string;
  ubicacion?: string;
  latitud?: number;
  longitud?: number;
  direccion?: string;
  precioHora?: number;
  idProveedor?: string;
  codigoUbigeo?: string;
  idEstadoCancha: number;

  calificacionPromedio?: number;
}