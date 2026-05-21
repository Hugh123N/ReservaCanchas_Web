import { GetDiaSemana } from "../diaSemana/GetDiaSemana";
import { GetHora } from "../hora/GetHora";

export interface GetHorarioCancha {
  idHorarioCancha : number;
  idCancha : number;
  idDiaSemana : number;
  idHoraInicio : string;
  idHoraFin : string;
  precioHora : number;
  diaSemana : GetDiaSemana;
  horaInicio : GetHora;
}
