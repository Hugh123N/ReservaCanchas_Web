import { ReservaClienteDto, SearchReservaClienteFilterDto } from 'app/features/reserva/core/model/reservaCliente.model';
import { EstadoReservaCodigo, EstadoReservaNombre, getEstadoReservaMeta } from '@shared/enums/estado-reserva.enum';
import { getEstadoPagoMeta } from '@shared/enums/estado-pago.enum';
import { calcularHorasRestantes, formatFechaHora, formatFechaLocal } from '@shared/utils/date.utils';
import { RangoHorario } from '@shared/utils/horario.utils';

export const OPCIONES_ESTADO_RESERVA = [
  { value: EstadoReservaCodigo.PENDIENTE, label: EstadoReservaNombre.PENDIENTE, tab: 'Pendientes' },
  { value: EstadoReservaCodigo.CONFIRMADO, label: EstadoReservaNombre.CONFIRMADO, tab: 'Confirmadas' },
  { value: EstadoReservaCodigo.CANCELADO, label: EstadoReservaNombre.CANCELADO, tab: 'Canceladas' },
  { value: EstadoReservaCodigo.EXPIRADO, label: EstadoReservaNombre.EXPIRADO, tab: 'Expiradas' }
];

export interface VencimientoReserva {
  texto: string;
  fecha: string;
  urgente: boolean;
  plazoCumplido: boolean;
}

function minutosDeHora(hora: string, fin = false): number | null {
  if (typeof hora !== 'string' || !/^\d{2}:\d{2}/.test(hora)) return null;
  const [h, m] = hora.slice(0, 5).split(':').map(Number);
  if (m > 59 || h > 24 || (h === 24 && (!fin || m !== 0))) return null;
  return h * 60 + m;
}

function horaDeMinutos(minutos: number): string {
  return `${String(Math.floor(minutos / 60) % 24).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
}

export function agruparHorariosReserva(horarios: ReservaClienteDto['horarios']): { rangos: RangoHorario[]; duracionMinutos: number } {
  const intervalos: { inicio: number; fin: number }[] = [];
  for (const horario of horarios ?? []) {
    const inicio = minutosDeHora(horario.horaInicio);
    const fin = minutosDeHora(horario.horaFin, true);
    if (inicio === null || fin === null || inicio === fin) continue;
    intervalos.push({ inicio, fin: fin < inicio ? fin + 1440 : fin });
  }
  intervalos.sort((a, b) => a.inicio - b.inicio);
  const unidos: typeof intervalos = [];
  for (const intervalo of intervalos) {
    const anterior = unidos[unidos.length - 1];
    if (anterior && intervalo.inicio <= anterior.fin) anterior.fin = Math.max(anterior.fin, intervalo.fin);
    else unidos.push({ ...intervalo });
  }
  return {
    rangos: unidos.map(r => ({ inicio: horaDeMinutos(r.inicio), fin: horaDeMinutos(r.fin) })),
    duracionMinutos: unidos.reduce((total, r) => total + r.fin - r.inicio, 0)
  };
}

export function getContactoCancha(telefono?: string | null): string | null {
  let digitos = telefono?.replace(/\D/g, '') ?? '';
  if (digitos.length < 7 || digitos.length > 15) return null;
  if (digitos.length <= 9) digitos = `51${digitos}`;
  return `https://wa.me/${digitos}`;
}

export function getVencimientoReserva(reserva: ReservaClienteDto): VencimientoReserva | null {
  if (!reserva.estaPendiente || !reserva.fechaExpiracionPreReserva) return null;
  const horas = calcularHorasRestantes(reserva.fechaExpiracionPreReserva);
  if (!Number.isFinite(horas)) return null;
  const fecha = formatFechaHora(reserva.fechaExpiracionPreReserva);
  return {
    fecha, urgente: horas <= 6, plazoCumplido: horas <= 0,
    texto: horas <= 0 ? 'Plazo de confirmación cumplido' : horas < 1 ? 'Expira en menos de 1 h' :
      horas <= 6 ? `Expira en aproximadamente ${Math.ceil(horas)} h` : `Confirmar antes del ${fecha}`
  };
}

export function normalizarFiltrosReserva(filtros: SearchReservaClienteFilterDto): SearchReservaClienteFilterDto {
  const resultado: SearchReservaClienteFilterDto = {};
  for (const key of Object.keys(filtros) as (keyof SearchReservaClienteFilterDto)[]) {
    const value = filtros[key]?.trim();
    if (value) resultado[key] = value;
  }
  return resultado;
}

export function presentarReserva(reserva: ReservaClienteDto) {
  const estado = getEstadoReservaMeta(reserva.codigoEstadoReserva);
  const pago = getEstadoPagoMeta(reserva.estadoPago);
  const fecha = new Date(reserva.fecha);
  const fechaValida = !Number.isNaN(fecha.getTime());
  const { rangos, duracionMinutos } = agruparHorariosReserva(reserva.horarios);
  const horas = Math.floor(duracionMinutos / 60);
  const minutos = duracionMinutos % 60;
  return {
    reserva,
    estado: { ...estado, label: reserva.estadoReserva || estado.label, cssClass: estado.cssClass || 'bg-neutral-100 text-neutral-700' },
    pago,
    pagoTexto: pago.label === 'Pagado' ? 'Pago completo' : `Pago ${pago.label.toLowerCase()}`,
    dia: fechaValida ? String(fecha.getDate()).padStart(2, '0') : '—',
    mes: fechaValida ? fecha.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '') : 'Fecha',
    fechaCorta: formatFechaLocal(reserva.fecha, { day: 'numeric', month: 'short', year: 'numeric' }),
    fechaLarga: formatFechaLocal(reserva.fecha, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    fechaCreacion: formatFechaHora(reserva.fechaCreacion),
    rangos,
    horarios: rangos.map(r => `${r.inicio} – ${r.fin}`).join(' · ') || 'Horario no disponible',
    duracion: duracionMinutos ? `${horas ? `${horas} h` : ''}${horas && minutos ? ' ' : ''}${minutos ? `${minutos} min` : ''}` : '',
    contacto: getContactoCancha(reserva.telefonoCancha),
    vencimiento: getVencimientoReserva(reserva)
  };
}
