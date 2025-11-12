import { GetPago } from "app/features/pago/core/model/getPago.model";
import { GetReserva } from "./getReserva.model";

/**
 * DTO que contiene la información completa de una reserva con su pago
 * Para sistema de pre-reserva con pago en efectivo coordinado por operador
 */
export interface ReservaConPagoDto {
    /** Datos de la reserva creada */
    reserva: GetReserva;

    /** Datos del pago pendiente asociado a la reserva */
    pago: GetPago;

    /** Código único de la reserva (ej: RES-2024-0001) */
    codigoReserva?: string | null;

    /** Duración de la pre-reserva en horas */
    duracionPreReservaHoras: number;

    /** Fecha y hora de expiración de la pre-reserva */
    fechaExpiracionPreReserva?: string | null;

    /** Teléfono de la cancha para coordinar el pago */
    telefonoCancha?: string | null;

    /** Nombre del operador/proveedor */
    nombreOperador?: string | null;

    // ========== CAMPOS OBSOLETOS (Ya no se usan) ==========

    /** @deprecated QR code en formato Base64 (OBSOLETO - Solo se usaba para Yape/Plin) */
    qrCodeBase64?: string | null;

    /** @deprecated Texto plano contenido en el QR (OBSOLETO - Solo se usaba para Yape/Plin) */
    qrText?: string | null;

    /** @deprecated Número de cuenta bancaria (OBSOLETO - Solo se usaba para Transferencia) */
    numeroCuenta?: string | null;

    /** @deprecated CCI - Código de Cuenta Interbancario (OBSOLETO - Solo se usaba para Transferencia) */
    cci?: string | null;

    /** @deprecated Nombre del banco (OBSOLETO - Solo se usaba para Transferencia) */
    nombreBanco?: string | null;

    /** @deprecated Titular de la cuenta bancaria (OBSOLETO - Solo se usaba para Transferencia) */
    titularCuenta?: string | null;

    /** @deprecated Minutos que tiene el usuario para completar el pago (OBSOLETO - Usar duracionPreReservaHoras) */
    minutosExpiracion: number;

    /** @deprecated Fecha y hora de expiración del pago (OBSOLETO - Usar fechaExpiracionPreReserva) */
    fechaExpiracion: string;

    // ========== CAMPOS ACTUALES ==========

    /** Método de pago seleccionado (siempre "Efectivo") */
    metodoPago: string;

    /** Monto a pagar en formato string (ej: "45.00") */
    montoFormateado: string;

    /** Moneda del pago (ej: "PEN") */
    moneda: string;

    /** Información adicional del método de pago */
    informacionAdicional?: string | null;
}