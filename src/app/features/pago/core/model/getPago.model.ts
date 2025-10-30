import { Pago } from "./pago.model";

export interface GetPago extends Pago {
    idPago: number;
    activo: boolean;
}