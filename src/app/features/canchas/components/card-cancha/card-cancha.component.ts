import { Component, Inject, Input, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchCancha } from '../../core/model/searchCancha.model';
import { Router } from '@angular/router';
import { CanchaFavoritaService } from '../../core/services/cancha-favorita.service';
import { AuthService } from '@core/auth/services/auth.service';
import { BaseComponent } from '@base/components/base-component/base.component';

@Component({
  selector: 'app-card-cancha',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule],
  templateUrl: './card-cancha.component.html',
  styleUrl: './card-cancha.component.css'
})
export class CardCanchaComponent extends BaseComponent{
  @Input() field!: SearchCancha;

  constructor(
    private router: Router,
    private canchaFavoritaService: CanchaFavoritaService,
    private authService: AuthService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) { 
    super('CARD-CANCHA', viewContainerRef);
  }

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

  get horarios(): string[] {
    return this.field?.horariosDisponibles || [];
  }

  get disponible(): boolean {
    return this.field?.estadoCancha?.codigo === this.ESTADO_CANCHA.APROBADO;
  }

  get estadoTexto(): string {
    const estado = this.field?.estadoCancha?.codigo;
    if (estado === this.ESTADO_CANCHA.MANTENIMIENTO) return 'En Mantenimiento';
    if (estado !== this.ESTADO_CANCHA.APROBADO) return 'No Disponible';
    return '';
  }

  verDetalle(id: number) {
    this.router.navigate(['/cancha', id]);
  }

  esFavorito(): boolean {
    if (!this.field?.idCancha) return false;
    return this.canchaFavoritaService.isFavorito(this.field.idCancha);
  }

  async onToggleFavorito(event: Event): Promise<void> {
    event.stopPropagation();
    event.preventDefault();

    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.openWarningAlert('Debes iniciar sesión para agregar a favoritos');
      return;
    }

    try {
      await this.canchaFavoritaService.toggleFavorito(this.field.idCancha!);
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      this.openErrorAlert('Error al actualizar favoritos. Por favor, intenta nuevamente.');
    }
  }
}
