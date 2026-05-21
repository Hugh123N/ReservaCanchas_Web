import { Reserva } from "./reserva.model";

export interface SearchReserva extends Reserva {
    fechaExpiracionPreReserva?: string;
    idEstadoReserva: number;
    idReserva?: number;
}