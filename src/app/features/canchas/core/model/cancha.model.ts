export interface Cancha {
  idProveedor: number;
  idTipoSuperficie: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  telefonoCancha?: string;
  direccion?: string;
  codigoUbigeo?: string;
  latitud?: number;
  longitud?: number;
  capacidadJugadores?: number;
  idEstadoCancha: number;
  tieneTecho: boolean;
  tieneIluminacion: boolean;
  pais?: string;

  duracionPreReserva?: number;
  porcentajeAdelanto?: number;

  calificacionPromedio?: number;
}