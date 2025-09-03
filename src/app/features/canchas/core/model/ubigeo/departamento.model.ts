import { Provincia } from "./provincia.model";

export interface Departamento {
  codigo?: string;
  nombre?: string;
  provincias?: Provincia[];
}