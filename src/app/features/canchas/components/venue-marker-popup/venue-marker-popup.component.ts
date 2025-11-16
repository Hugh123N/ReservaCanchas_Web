import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { UbicacionCancha } from '../../../../shared/interfaces/location.interface';

/**
 * Componente popup para marcadores de canchas en el mapa
 * Muestra información compacta de la cancha cuando se hace click en el marcador
 */
@Component({
  selector: 'app-venue-marker-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './venue-marker-popup.component.html',
  styleUrl: './venue-marker-popup.component.css'
})
export class VenueMarkerPopupComponent {
  @Input() venue!: UbicacionCancha;

  constructor(private router: Router) { }

  /**
   * Navega a la página de detalle de la cancha
   */
  verDetalles(): void {
    this.router.navigate(['/cancha', this.venue.id]);
  }

  /**
   * Obtiene el formato de precio para mostrar
   */
  get mostrarPrecio(): string {
    return `S/ ${this.venue.precioDesde.toFixed(2)}`;
  }

  /**
   * Obtiene los deportes para mostrar (límite de 2)
   */
  get mostrarDeportes(): string[] {
    return this.venue.deportes.slice(0, 2);
  }

  /**
   * Verifica si hay más deportes para mostrar
   */
  get tieneDeportesAdicionales(): boolean {
    return this.venue.deportes.length > 2;
  }

  /**
   * Obtiene la cantidad de deportes adicionales
   */
  get cantidadDeportesAdicionales(): number {
    return this.venue.deportes.length - 2;
  }
}
