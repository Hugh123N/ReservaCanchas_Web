import { GetPlanTarifaDto } from './plan-tarifa.model';
import { PlanCaracteristicaDto } from './plan-caracteristica.model';
import { PlanLimiteDto } from './plan-limite.model';

export interface Plan {
  idPlane: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  ordenVisual: number | null;
  activo: boolean;
}

export interface ListPlaneDto extends Plan {
  planCaracteristicas: PlanCaracteristicaDto[];
  planTarifa: GetPlanTarifaDto[];
  planLimite: PlanLimiteDto[];
  precio?: number;
  icono?: string;
  destacado?: boolean;
}

export interface GetPlaneDto extends Plan {
  planCaracteristicas: PlanCaracteristicaDto[];
  planTarifa: GetPlanTarifaDto[];
}
