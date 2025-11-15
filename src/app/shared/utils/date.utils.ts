/**
 * Utilidades para manejo de fechas
 * Funciones reutilizables para formateo, validación y cálculos de fechas
 */

/**
 * Formatea una fecha a formato local español
 * @param fecha - String de fecha o objeto Date
 * @param options - Opciones de formato (opcional)
 * @returns Fecha formateada en español o '-' si la fecha es inválida
 */
export function formatFechaLocal(
  fecha: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!fecha) return '-';

  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

  if (isNaN(date.getTime())) return '-';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  const finalOptions = options || defaultOptions;
  return date.toLocaleDateString('es-PE', finalOptions);
}

/**
 * Formatea una hora a formato local español
 * @param fecha - String de fecha o objeto Date
 * @returns Hora formateada en español
 */
export function formatHoraLocal(fecha: string | Date): string {
  if (!fecha) return '-';

  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

  if (isNaN(date.getTime())) return '-';

  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea una fecha completa (fecha + hora)
 * @param fecha - String de fecha o objeto Date
 * @returns Fecha y hora formateadas
 */
export function formatFechaHora(fecha: string | Date): string {
  if (!fecha) return '-';

  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

  if (isNaN(date.getTime())) return '-';

  return date.toLocaleString('es-PE', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Genera un array de fechas futuras a partir de hoy
 * @param days - Número de días hacia adelante (por defecto 7)
 * @returns Array de objetos Date
 */
export function generateFutureDates(days: number = 7): Date[] {
  const today = new Date();
  const dates: Date[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  return dates;
}

/**
 * Calcula las horas restantes entre ahora y una fecha futura
 * @param fechaFutura - Fecha futura como string o Date
 * @returns Horas restantes (positivo) o 0 si ya pasó
 */
export function calcularHorasRestantes(fechaFutura: string | Date): number {
  if (!fechaFutura) return 0;

  const now = new Date().getTime();
  const futuro = typeof fechaFutura === 'string'
    ? new Date(fechaFutura).getTime()
    : fechaFutura.getTime();

  const horasRestantes = (futuro - now) / (1000 * 60 * 60);

  return Math.max(0, horasRestantes);
}

/**
 * Verifica si una fecha está en el pasado
 * @param fecha - Fecha a verificar
 * @returns true si la fecha ya pasó
 */
export function esFechaPasada(fecha: string | Date): boolean {
  if (!fecha) return false;

  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const now = new Date();

  return date.getTime() < now.getTime();
}

/**
 * Verifica si una fecha está en el futuro
 * @param fecha - Fecha a verificar
 * @returns true si la fecha es futura
 */
export function esFechaFutura(fecha: string | Date): boolean {
  if (!fecha) return false;

  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const now = new Date();

  return date.getTime() > now.getTime();
}

/**
 * Obtiene la fecha de hoy sin hora (00:00:00)
 * @returns Date con hora en 00:00:00
 */
export function getHoyInicio(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Obtiene la fecha de hoy al final del día (23:59:59)
 * @returns Date con hora en 23:59:59
 */
export function getHoyFin(): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

/**
 * Formatea una fecha para input type="date" (YYYY-MM-DD)
 * @param fecha - Fecha a formatear
 * @returns String en formato YYYY-MM-DD
 */
export function formatParaInput(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Compara dos fechas sin considerar la hora
 * @param fecha1 - Primera fecha
 * @param fecha2 - Segunda fecha
 * @returns true si son el mismo día
 */
export function esMismoDia(fecha1: Date | string, fecha2: Date | string): boolean {
  const d1 = typeof fecha1 === 'string' ? new Date(fecha1) : fecha1;
  const d2 = typeof fecha2 === 'string' ? new Date(fecha2) : fecha2;

  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * Agrega días a una fecha
 * @param fecha - Fecha base
 * @param dias - Número de días a agregar (puede ser negativo)
 * @returns Nueva fecha con los días agregados
 */
export function agregarDias(fecha: Date | string, dias: number): Date {
  const date = typeof fecha === 'string' ? new Date(fecha) : new Date(fecha);
  date.setDate(date.getDate() + dias);
  return date;
}

/**
 * Obtiene el nombre del día de la semana
 * @param fecha - Fecha
 * @returns Nombre del día en español
 */
export function getNombreDia(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

  if (isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('es-PE', { weekday: 'long' });
}

/**
 * Obtiene el nombre del mes
 * @param fecha - Fecha
 * @returns Nombre del mes en español
 */
export function getNombreMes(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

  if (isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('es-PE', { month: 'long' });
}
