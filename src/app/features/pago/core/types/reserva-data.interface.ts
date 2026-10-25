import { GetCancha } from "app/features/canchas/core/model/getCancha.model";
import { TimeOption } from "app/features/canchas/core/types/time-option.interface";

export interface ReservaData {
  canchaId: number;
  cancha?: GetCancha;
  fecha: string;
  selectedTime: TimeOption[];
  duracion: number;
  /** Legacy: el teléfono ahora se toma del perfil y se edita en la vista de pago */
  telefono?: string;
  precioHora: number;
  total: number;
  idTipoDeporte: number;
}
