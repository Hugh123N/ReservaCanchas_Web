import { Pago } from "./pago.model";

export interface UpdatePago extends Pago {
    idPago: number;
}