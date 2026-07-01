import { GetHorarioCancha } from "app/features/canchas/core/model";

/**
 * DTO con información de reserva para visualización del cliente
 * Usado en el módulo "Mis Reservas" (Sprint 2)
 */
export interface ReservaClienteDto {
    // Información de la reserva
    idReserva: number;
    codigoReserva: string;
    fecha: string; // DateTimeOffset en formato ISO
    monto: number;

    // Información del estado
    estadoReserva: string; // "Pendiente", "Confirmado", "Cancelado", "Expirado"
    codigoEstadoReserva: string; // "01", "02", "03", "04"

    // Información de la cancha
    idCancha: number;
    nombreCancha: string;
    direccionCancha: string;
    telefonoCancha?: string | null;

    // Horarios reservados
    horarios: GetHorarioCancha[];

    // Información del pago
    estadoPago: string; // "Pagado", "Parcial", "Pendiente"
    montoAdelanto: number;
    montoPendiente: number;
    numeroRecibo?: string | null;

    // Fechas de control
    fechaExpiracionPreReserva?: string | null;
    fechaCreacion: string;

    // Indicadores calculados (helpers para UI)
    estaConfirmada: boolean;
    estaPendiente: boolean;
    estaCancelada: boolean;
    estaExpirada: boolean;
    tienePagoPendiente: boolean;
}

/**
 * Filtros para búsqueda de reservas del cliente
 * Usado con el endpoint POST /api/Reserva/mis-reservas/{idUsuario}
 */
export interface SearchReservaClienteFilterDto {
    codigoEstado?: string | null;          // "01", "02", "03", "04"
    fechaDesde?: string | null;            // DateTimeOffset ISO
    fechaHasta?: string | null;            // DateTimeOffset ISO
    estadoPago?: string | null;            // "Pendiente", "Parcial", "Pagado"
    codigoReserva?: string | null;         // Buscar por código
    nombreCancha?: string | null;          // Buscar por nombre de cancha
}
