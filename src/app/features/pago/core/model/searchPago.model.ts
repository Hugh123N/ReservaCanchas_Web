import { Pago } from "./pago.model";

export interface SearchPago extends Pago {
    idPago: number;
    estadoPago?: string | null;
    metodoPago?: string | null;
}
