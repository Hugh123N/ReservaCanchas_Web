export interface CompletarPago {
  idPago: number;
  montoRestante: number;
  numeroRecibo?: string | null;
}