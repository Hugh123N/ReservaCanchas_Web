import { Ubigeo } from 'app/features/canchas/core/model/ubigeo/ubigeo.model';

export interface UbicacionOpcion {
  codigo: string;
  nombre: string;
  detalle: string;
  tipo: 'provincia' | 'distrito';
}

export function normalizarBusqueda(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
}

export function crearOpcionesUbicacion(ubigeos: Ubigeo[]): UbicacionOpcion[] {
  const provincias = new Map<string, UbicacionOpcion>();
  const distritos = new Map<string, UbicacionOpcion>();
  for (const ubigeo of ubigeos) {
    if (!/^\d{6}$/.test(ubigeo.codigoUbigeo)) continue;
    const provincia = ubigeo.codigoUbigeo.slice(0, 4);
    provincias.set(provincia, {
      codigo: provincia, nombre: ubigeo.provincia,
      detalle: `Provincia · ${ubigeo.departamento}`, tipo: 'provincia'
    });
    distritos.set(ubigeo.codigoUbigeo, {
      codigo: ubigeo.codigoUbigeo, nombre: ubigeo.distrito,
      detalle: `Distrito · ${ubigeo.provincia}, ${ubigeo.departamento}`, tipo: 'distrito'
    });
  }
  const ordenar = (a: UbicacionOpcion, b: UbicacionOpcion) => a.nombre.localeCompare(b.nombre, 'es');
  return [...provincias.values()].sort(ordenar).concat([...distritos.values()].sort(ordenar));
}
