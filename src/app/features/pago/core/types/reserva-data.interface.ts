import { GetCancha } from "app/features/canchas/core/model/getCancha.model";
import { TimeOption } from "app/features/canchas/core/types/time-option.interface";

export interface ReservaData {
  canchaId: number;
  cancha?: GetCancha;
  fecha: string;
  selectedTime: TimeOption[];
  duracion: number;
  telefono: string;
  precioHora: number;
  total: number;
}
