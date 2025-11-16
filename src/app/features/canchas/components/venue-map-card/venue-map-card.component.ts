import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { UbicacionCancha } from '../../../../shared/interfaces/location.interface';

/**
 * Componente de tarjeta compacta para mostrar canchas en sidebar/bottom sheet del mapa
 */
@Component({
  selector: 'app-venue-map-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './venue-map-card.component.html',
  styleUrl: './venue-map-card.component.css'
})
export class VenueMapCardComponent {
  @Input() venue!: UbicacionCancha;
  @Input() isHighlighted: boolean = false;
  @Input() distance?: number; // Distancia en km desde la ubicación del usuario

  @Output() cardHover = new EventEmitter<boolean>();
  @Output() cardClick = new EventEmitter<UbicacionCancha>();

  constructor(private router: Router) { }

  /**
   * Maneja la entrada del mouse
   */
  @HostListener('mouseenter')
  alEntrarMouse(): void {
    this.cardHover.emit(true);
  }

  /**
   * Maneja la salida del mouse
   */
  @HostListener('mouseleave')
  alSalirMouse(): void {
    this.cardHover.emit(false);
  }

  /**
   * Navega a la página de detalle de la cancha
   */
  verDetalles(): void {
    this.router.navigate(['/cancha', this.venue.id]);
  }

  /**
   * Maneja el click en la tarjeta
   */
  alHacerClick(): void {
    this.cardClick.emit(this.venue);
  }

  /**
   * Obtiene el formato de precio para mostrar
   */
  get mostrarPrecio(): string {
    return `S/ ${this.venue.precioDesde.toFixed(2)}`;
  }

  /**
   * Obtiene los deportes para mostrar (límite de 3)
   */
  get mostrarDeportes(): string[] {
    return this.venue.deportes.slice(0, 3);
  }

  /**
   * Verifica si hay más deportes para mostrar
   */
  get tieneDeportesAdicionales(): boolean {
    return this.venue.deportes.length > 3;
  }

  /**
   * Obtiene la cantidad de deportes adicionales
   */
  get cantidadDeportesAdicionales(): number {
    return this.venue.deportes.length - 3;
  }

  /**
   * Obtiene la distancia formateada
   */
  get mostrarDistancia(): string | null {
    if (this.distance === undefined) return null;

    if (this.distance < 1) {
      return `${Math.round(this.distance * 1000)} m`;
    }
    return `${this.distance.toFixed(1)} km`;
  }

  /**
   * Obtiene la imagen por defecto
   */
  get imagenPorDefecto(): string {
    return 'assets/images/default-field.png';
  }

  /**
   * Obtiene la imagen de la cancha
   */
  get imagenCancha(): string {
    return this.venue.imagenUrl || this.imagenPorDefecto;
  }
}
