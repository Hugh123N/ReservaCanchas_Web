import { ReservaClienteDto } from 'app/features/reserva/core/model/reservaCliente.model';
import { agruparHorariosReserva, getContactoCancha, getVencimientoReserva, normalizarFiltrosReserva, presentarReserva } from './reserva-presentacion.utils';

describe('Presentación de reservas', () => {
  const reserva: ReservaClienteDto = {
    idReserva: 1, codigoReserva: 'RES-2026-001', idCancha: 2, nombreCancha: 'Cancha de prueba', direccionCancha: 'Av. Marina 123',
    fecha: '2026-10-28T18:00:00-05:00', fechaCreacion: '2026-10-27T12:00:00-05:00', monto: 120,
    montoAdelanto: 40, montoPendiente: 80, estadoPago: 'Parcial', estadoReserva: 'Pendiente', codigoEstadoReserva: '01',
    estaConfirmada: false, estaCancelada: false, estaExpirada: false, estaPendiente: true, tienePagoPendiente: true, horarios: []
  };

  it('merges consecutive and overlapping half-hours without mutating the source', () => {
    const horarios = [
      { horaInicio: '19:00:00', horaFin: '19:30:00' },
      { horaInicio: '18:00:00', horaFin: '18:30:00' },
      { horaInicio: '18:30:00', horaFin: '19:00:00' },
      { horaInicio: '18:00:00', horaFin: '19:00:00' },
      { horaInicio: '21:00:00', horaFin: '21:30:00' }
    ];
    const original = structuredClone(horarios);
    expect(agruparHorariosReserva(horarios)).toEqual({
      rangos: [{ inicio: '18:00', fin: '19:30' }, { inicio: '21:00', fin: '21:30' }], duracionMinutos: 120
    });
    expect(horarios).toEqual(original);
  });

  it('handles midnight and excludes malformed or zero-length intervals', () => {
    expect(agruparHorariosReserva([
      { horaInicio: '23:00:00', horaFin: '23:30:00' }, { horaInicio: '23:30:00', horaFin: '00:00:00' },
      { horaInicio: 'invalida', horaFin: '12:00' }, { horaInicio: '12:00', horaFin: '12:00' }
    ])).toEqual({ rangos: [{ inicio: '23:00', fin: '00:00' }], duracionMinutos: 60 });
  });

  it('does not duplicate the Peruvian prefix and safely handles missing phone numbers', () => {
    expect(getContactoCancha('999 123 456')).toBe('https://wa.me/51999123456');
    expect(getContactoCancha('+51 999 123 456')).toBe('https://wa.me/51999123456');
    expect(getContactoCancha(null)).toBeNull();
    expect(getContactoCancha('sin teléfono')).toBeNull();
  });

  it('removes empty filters instead of counting undefined properties as active filters', () => {
    expect(normalizarFiltrosReserva({ nombreCancha: '  El Gol  ', codigoEstado: '', codigoReserva: null, estadoPago: undefined }))
      .toEqual({ nombreCancha: 'El Gol' });
  });

  it('keeps the reservation state and payment amounts reported by the API', () => {
    const vista = presentarReserva(reserva);
    expect(vista.estado.label).toBe('Pendiente');
    expect(vista.pago.label).toBe('Parcial');
    expect(vista.reserva.monto).toBe(120);
    expect(vista.reserva.montoAdelanto).toBe(40);
    expect(vista.reserva.montoPendiente).toBe(80);
  });

  it('shows minutes rather than zero remaining hours without changing the backend status', () => {
    const vista = getVencimientoReserva({ ...reserva, fechaExpiracionPreReserva: new Date(Date.now() + 30 * 60_000).toISOString() });
    expect(vista?.texto).toBe('Expira en menos de 1 h');
    expect(vista?.plazoCumplido).toBeFalse();
    const cumplida = presentarReserva({ ...reserva, fechaExpiracionPreReserva: new Date(Date.now() - 60_000).toISOString() });
    expect(cumplida.vencimiento?.plazoCumplido).toBeTrue();
    expect(cumplida.estado.label).toBe('Pendiente');
  });
});
