import { Reserva } from "./reserva.model";

export interface GetReserva extends Reserva {
    fechaExpiracionPreReserva?: string;
    idEstadoReserva: number;
    idReserva: number;
    activo: boolean;
}