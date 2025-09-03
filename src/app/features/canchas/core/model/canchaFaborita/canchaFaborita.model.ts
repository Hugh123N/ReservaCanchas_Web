export interface CanchaFavorita {
  idUsuario: string;          // Guid en backend → string en Angular
  idCancha: number;
  fechaAgregado: string;      // DateTimeOffset en backend → string ISO en Angular
}