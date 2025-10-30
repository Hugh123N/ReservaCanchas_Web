import { Reserva } from "./reserva.model";

export interface UpdateReserva extends Reserva {
    idReserva: number;
}