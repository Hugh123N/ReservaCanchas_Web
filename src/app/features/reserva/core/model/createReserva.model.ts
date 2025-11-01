import { Reserva } from "./reserva.model";
import { CreateReservaDetalle } from "./reservaDetalle/CreateReservaDetalle.model";

export interface CreateReserva extends Reserva {
    codigoMetodoPago: string;
    montoAdelanto?: number | null;
    detalles: CreateReservaDetalle[];
}