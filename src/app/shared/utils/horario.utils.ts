/**
 * Utilidades para manejo de horarios y disponibilidad
 */

import { TimeOption } from 'app/features/canchas/core/types/time-option.interface';
import { GetHorarioCancha } from '../../features/canchas/core/model/horarioCancha/gethorarioCancha.model';

/**
 * Agrupa horarios por hora exacta y suma los precios de las medias horas
 * Ejemplo: Si viene [10:00 (50), 10:30 (50), 11:00 (50), 11:30 (50)]
 * Retorna: [10:00 (100), 11:00 (100)]
 * 
 * @param horarios - Array de horarios disponibles del backend
 * @returns Array agrupado por hora exacta con precios sumados
 */
export function agruparHorariosPorHora(horarios: GetHorarioCancha[]): TimeOption[] {
  if (!horarios || horarios.length === 0) {
    return [];
  }

  // Agrupar por hora exacta (HH:00)
  const gruposMap = new Map<string, { idHorarioCancha: number; precio: number }>();

  horarios.forEach(horario => {
    // Extraer la hora del formato HH:mm
    const horaExacta = horario.horaInicio.substring(0, 5); // "10:00" de "10:00:00"
    const horaBase = `${horaExacta.substring(0, 2)}:00`; // "10:00"

    // Sumar precios
    const precioActual = gruposMap.get(horaBase) || { idHorarioCancha: 0, precio: 0 };
    gruposMap.set(horaBase, { idHorarioCancha: horario.idHorarioCancha ?? 0, precio: precioActual.precio + (horario.precio ?? 0) });
  });

  // Convertir Map a array y ordenar por hora
  const resultado: TimeOption[] = Array.from(gruposMap, ([hora, { idHorarioCancha, precio }]) => ({
    idHorarioCancha, 
    hora,
    precio
  })).sort((a, b) => a.hora.localeCompare(b.hora));

  return resultado;
}

/**
 * Desagrupa horarios de vuelta a medias horas con IDs consecutivos
 * Ejemplo: Si viene [10:00 (id: 12, precio: 100), 11:00 (id: 13, precio: 100)]
 * Retorna: [10:00 (id: 12, precio: 50), 10:30 (id: 13, precio: 50), 11:00 (id: 14, precio: 50), 11:30 (id: 15, precio: 50)]
 * 
 * @param horariosAgrupados - Array de TimeOption agrupados por hora
 * @returns Array desagrupado con medias horas y IDs consecutivos
 */
export function desagruparHorasPorMediaHora(horariosAgrupados: TimeOption[]): TimeOption[] {
  if (!horariosAgrupados || horariosAgrupados.length === 0) {
    return [];
  }

  const resultado: TimeOption[] = [];

  horariosAgrupados.forEach(horario => {
    const precioMediaHora = horario.precio ? horario.precio / 2 : 0;
    const id = horario.idHorarioCancha;

    // Primera media hora (HH:00)
    resultado.push({
      idHorarioCancha: id,
      hora: horario.hora,
      precio: precioMediaHora
    });

    // Segunda media hora (HH:30)
    const [hh, mm] = horario.hora.split(':');
    resultado.push({
      idHorarioCancha: id + 1,
      hora: `${hh}:30`,
      precio: precioMediaHora
    });
  });

  return resultado;
}

export interface RangoHorario {
  inicio: string;
  fin: string;
}

/**
 * Une horas seleccionadas que son consecutivas en un solo rango
 * Ejemplo: [07:00, 08:00, 11:00, 12:00] → [{07:00-09:00}, {11:00-13:00}]
 * El fin de cada rango es la hora final de la última franja seleccionada
 *
 * @param horas - Horas en formato "HH:mm" (también acepta "HH:mm:ss")
 */
export function agruparHorasConsecutivas(horas: string[]): RangoHorario[] {
  if (!horas || horas.length === 0) return [];

  const ordenadas = [...new Set(horas.map(normalizarHora))]
    .filter((h) => h !== '')
    .sort((a, b) => a.localeCompare(b));

  if (ordenadas.length === 0) return [];

  const rangos: RangoHorario[] = [];
  let inicio = ordenadas[0];
  let anterior = ordenadas[0];

  for (let i = 1; i < ordenadas.length; i++) {
    const actual = ordenadas[i];
    if (sumarHora(anterior, 1) === actual) {
      anterior = actual;
      continue;
    }
    rangos.push({ inicio, fin: sumarHora(anterior, 1) });
    inicio = actual;
    anterior = actual;
  }

  rangos.push({ inicio, fin: sumarHora(anterior, 1) });

  return rangos;
}

/**
 * Formatea horas consecutivas como rangos legibles
 * Ejemplo: [07:00, 08:00, 11:00, 12:00] → "07:00 - 09:00, 11:00 - 13:00"
 */
export function formatHorasConsecutivas(horas: string[]): string {
  const rangos = agruparHorasConsecutivas(horas);
  if (rangos.length === 0) return '-';
  return rangos.map((r) => `${r.inicio} - ${r.fin}`).join(', ');
}

/**
 * Formatea bloques de horarios ya resueltos por el backend (inicio-fin)
 * Ejemplo: [{10:00:00, 11:00:00}, {14:00:00, 15:00:00}] → "10:00-11:00, 14:00-15:00"
 */
export function formatRangosHorarios(
  horarios: { horaInicio: string; horaFin: string }[] | null | undefined
): string {
  if (!horarios || horarios.length === 0) return '-';

  return horarios
    .map((h) => `${h.horaInicio.substring(0, 5)}-${h.horaFin.substring(0, 5)}`)
    .join(', ');
}

function normalizarHora(hora: string): string {
  const [hh, mm] = hora.substring(0, 5).split(':');
  if (hh === undefined || mm === undefined || !/^\d{1,2}$/.test(hh) || !/^\d{2}$/.test(mm)) {
    return '';
  }
  return `${hh.padStart(2, '0')}:${mm}`;
}

function sumarHora(hora: string, horasASumar: number): string {
  const [hh, mm] = hora.split(':').map(Number);
  if (Number.isNaN(hh)) return hora;
  const nuevaHora = (hh + horasASumar) % 24;
  return `${String(nuevaHora).padStart(2, '0')}:${String(mm ?? 0).padStart(2, '0')}`;
}
