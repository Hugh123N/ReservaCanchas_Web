import { Reserva } from "./reserva.model";

export interface GetReserva extends Reserva {
    idReserva: number;
    activo: boolean;
}