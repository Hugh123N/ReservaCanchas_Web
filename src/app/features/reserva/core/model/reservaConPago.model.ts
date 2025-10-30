import { GetPago } from "app/features/pago/core/model/getPago.model";
import { GetReserva } from "./getReserva.model";

export interface ReservaConPagoDto {
    reserva: GetReserva;
    pago: GetPago;

    qrCodeBase64?: string | null;
    qrText?: string | null;

    numeroCuenta?: string | null;
    cci?: string | null;
    nombreBanco?: string | null;
    titularCuenta?: string | null;

    metodoPago: string;
    montoFormateado: string;
    moneda: string;

    minutosExpiracion: number;
    fechaExpiracion: string;

    informacionAdicional?: string | null;
}