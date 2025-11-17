import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { UbicacionCancha } from '../../../../shared/interfaces/location.interface';

@Component({
  selector: 'app-venue-map-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
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

  verDetalles(): void {
    this.router.navigate(['/cancha', this.venue.id]);
  }

  alHacerClick(): void {
    this.cardClick.emit(this.venue);
  }

  get mostrarPrecio(): string {
    return `S/ ${this.venue.precioDesde.toFixed(2)}`;
  }

  get mostrarDeportes(): string[] {
    return this.venue.deportes.slice(0, 3);
  }

  get tieneDeportesAdicionales(): boolean {
    return this.venue.deportes.length > 3;
  }

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

  get imagenPorDefecto(): string {
    return 'assets/images/default-field.png';
  }

  get imagenCancha(): string {
    return this.venue.imagenUrl || this.imagenPorDefecto;
  }
}
