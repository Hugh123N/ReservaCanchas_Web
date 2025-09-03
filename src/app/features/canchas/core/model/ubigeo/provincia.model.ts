import { Distrito } from "./distrito.model";

export interface Provincia {
  codigo?: string;
  nombre?: string;
  distritos?: Distrito[];
}