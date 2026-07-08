export interface GetPlanTarifaDto {
  idPlanTarifa: number;
  idPlane: number;
  codigo: string;
  nombre: string | null;
  precio: number;
  moneda: string;
  duracionDias: number;
  porcentajeDescuento: number | null;
  tipoCobro: string;
  permiteAutoRenovacion: boolean | null;
}
