export interface Cancha {
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  latitud?: number;
  longitud?: number;
  direccion?: string;
  precioHora?: number;
  idProveedor?: string;
  codigoUbigeo?: string;
  idEstadoCancha: number;
  duracionPreReserva?: number;
  porcentajeAdelanto?: number;
  telefonoCancha?: string;

  calificacionPromedio?: number;
}