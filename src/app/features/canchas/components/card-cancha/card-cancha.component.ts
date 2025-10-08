import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchCancha } from '../../core/model/searchCancha.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ESTADO_CANCHA } from '@core/constants/constants.constant';

@Component({
  selector: 'app-card-cancha',
  standalone: true,
  imports: [MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    CommonModule
  ],
  templateUrl: './card-cancha.component.html',
  styleUrl: './card-cancha.component.css'
})
export class CardCanchaComponent {
  @Input() field!: SearchCancha;

  //constructor(@Inject(PLATFORM_ID) private platformId: any) {}
  constructor(private router: Router,) { }


  ngOnInit() {
  }

  defaultImage = 'assets/images/default-field.png';

  get mainImage(): string {
    if (this.field?.imagenesCancha && this.field.imagenesCancha.length > 0) {
      const principal = this.field.imagenesCancha.find(img => img.esPrincipal && img.activo);
      return principal?.urlImagen || this.field.imagenesCancha[0].urlImagen || this.defaultImage;
    }
    return this.defaultImage;
  }

  get ubicacion(): string {
    return this.field?.ubigeo
      ? `${this.field.ubigeo.distrito}, ${this.field.ubigeo.provincia}`
      : '';
  }

  get deporte(): string {
    return this.field?.tipoCancha?.nombre || '';
  }

  get horarios(): string[] {
    return this.field?.horariosDisponibles || [];
  }

  get disponible(): boolean {
    return this.field?.estadoCancha?.codigo === ESTADO_CANCHA.APROBADO;
  }

  get estadoTexto(): string {
    const estado = this.field?.estadoCancha?.codigo;
    if (estado === ESTADO_CANCHA.MANTENIMIENTO) return 'En Mantenimiento';
    if (estado !== ESTADO_CANCHA.APROBADO) return 'No Disponible';
    return '';
  }

  verDetalle(id: number) {
    this.router.navigate(['/cancha', id]);
  }
}
