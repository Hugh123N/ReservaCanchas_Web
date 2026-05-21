import { Reserva } from "./reserva.model";

export interface ListReserva extends Reserva {
    fechaExpiracionPreReserva?: string;
    idEstadoReserva: number;
}