import { CanchasFilter } from "../core/types/canchas-filter";

export function canchasParams(form: Partial<CanchasFilter>) {
  return {
    nombre: form.nombre?.trim() ?? null,
    codigoUbigeo: form.codigoUbigeo?.trim() ?? null,
    fecha: form.fecha?.trim() ?? null,
    hora: form.hora?.trim() ?? null,
    idTipoCancha: form.idTipoDeporte,
    idEstadoCancha: form.idEstadoCancha
  };
}
