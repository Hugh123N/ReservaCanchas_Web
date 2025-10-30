import { Reserva } from "./reserva.model";

export interface CreateReserva extends Reserva {
    codigoMetodoPago: string;
    montoAdelanto?: number | null;
}