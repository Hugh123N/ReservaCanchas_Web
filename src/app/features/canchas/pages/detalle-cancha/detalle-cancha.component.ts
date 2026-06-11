import { ChangeDetectorRef, Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Components
import { FooterComponent } from '@shared/components/footer/footer.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';

// Material Modules
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Interfaces
import { GetCancha } from '../../core/model/getCancha.model';
import { CanchaService } from '../../core/services/cancha.service';
import { BaseComponent } from '@base/components/base-component/base.component';
import { RequestDisponibilidad } from '../../core/model/disponibilidad/requestDisponibilidad.model';
import { AuthService } from '@core/auth/services/auth.service';
import { generateFutureDates, getNombreDia, getNombreMes, formatParaInput } from '@shared/utils/date.utils';
import { agruparHorariosPorHora } from '@shared/utils/horario.utils';
import { DateOption } from '../../core/types/date-option';
import { TimeOption } from '../../core/types/time-option.interface';

import { CanchaFavoritaService } from '../../core/services/cancha-favorita.service';
import { HorarioCanchaService } from '../../core/services/horarioCancha.service';

@Component({
  selector: 'app-detalle-cancha',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavVarComponent,
    FooterComponent,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule
  ],
  templateUrl: './detalle-cancha.component.html',
  styleUrl: './detalle-cancha.component.css'
})

export class DetalleCanchaComponent extends BaseComponent implements OnInit {
  reservaForm: FormGroup;
  canchaId: number = 0;
  selectedTabIndex: number = 0;

  // Selected States
  selectedDate: DateOption | null = null;
  selectedTime: TimeOption[] | null = null;

  // Data
  canchaData: GetCancha;

  // Available dates (next 7 days)
  fechasDisponibles: DateOption[] = [];

  // Cycling icon colors for services
  private readonly iconColorOrder = ['icon-accent', 'icon-secondary', 'icon-primary'] as const;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private canchasService: CanchaService,
    private horarioCanchaService: HorarioCanchaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private canchaFavoritaService: CanchaFavoritaService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('CANCHAS', viewContainerRef);
    this.canchaData = {} as GetCancha;
    this.reservaForm = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern(/^(\+51|51)?[9][0-9]{8}$/)]],
      duracion: [1]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.canchaId = +params['id'];
      this.loadCanchaData();
    });
    // Generate available dates
    this.generateAvailableDates();
    var telefono = this.authService.loadUserProfile()?.telefono ?? null;
    this.reservaForm.patchValue({ telefono: telefono });
  }

  getServiceIconClass(index: number): string {
    return this.iconColorOrder[index % this.iconColorOrder.length];
  }

  loadCanchaData() {
    this.canchasService.get(this.canchaId).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.canchaData = response.data;
        }
      },
      error: (err) => {
        this.openAlert(err);
      },
    });
  }

  generateAvailableDates() {
    const dates = generateFutureDates(7);
    this.fechasDisponibles = [];

    dates.forEach((date, i) => {
      const nombreDia = getNombreDia(date);
      const nombreMes = getNombreMes(date);

      // Abreviar nombres (primeras 3 letras)
      const diaAbreviado = nombreDia.substring(0, 3);
      const mesAbreviado = nombreMes.substring(0, 3);

      this.fechasDisponibles.push({
        dia: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : diaAbreviado.charAt(0).toUpperCase() + diaAbreviado.slice(1),
        numero: date.getDate().toString().padStart(2, '0'),
        mes: mesAbreviado.charAt(0).toUpperCase() + mesAbreviado.slice(1),
        fecha: formatDateLocal(date),
      });
    });
  }

  getAvailableHours(): TimeOption[] {
    if (!this.selectedDate || !this.canchaData.horariosDisponibles) {
      return [];
    }

    return agruparHorariosPorHora(this.canchaData.horariosDisponibles);
  }

  getMainImage(): string {
    if (this.canchaData.imagenesCancha && this.canchaData.imagenesCancha.length > 0) {
      const principal = this.canchaData.imagenesCancha.find(img => img.esPrincipal);
      return principal?.urlImagen || this.canchaData.imagenesCancha[0].urlImagen;
    }
    return 'https://img.freepik.com/fotos-premium/cancha-futbol-atardecer-fondo_670382-6866.jpg?w=1060';
  }

  getFullAddress(): string {
    if (this.canchaData.ubigeo) {
      return `${this.canchaData.direccion}`;
    }
    return this.canchaData.direccion || 'Dirección no disponible';
  }

  getStatusClass(): string {
    const status = this.canchaData.estadoCancha?.nombre?.toLowerCase() || '';
    if (status.includes('disponible') || status.includes('aprobado')) return 'status-disponible';
    if (status.includes('mantenimiento')) return 'status-mantenimiento';
    return 'status-ocupado';
  }

  getDateCardClass(fecha: DateOption): string {
    let classes = 'date-card';
    if (this.selectedDate?.fecha === fecha.fecha) classes += ' selected';
    return classes;
  }

  getTimeButtonClass(time: TimeOption): string {
    let classes = 'time-btn';
    if (this.selectedTime?.some(t => t.hora === time.hora)) {
      classes += ' selected';
    } else {
      classes += ' available';
    }
    return classes;
  }

  selectDate(fecha: DateOption) {
    this.selectedDate = fecha;
    this.selectedTime = null; // Reset selected time

    const body: RequestDisponibilidad = {
      idCancha: this.canchaData.idCancha!,
      fecha: fecha.fecha
    };

    //this.loadingHorarios = true;

    this.horarioCanchaService.horarioDisponible(body).subscribe({
      next: (res) => {
        //this.loadingHorarios = false;
        if (res.isValid && res.data) {
          this.canchaData.horariosDisponibles = res.data;
        } else {
          this.canchaData.horariosDisponibles = [];
        }
        // Mark for check to schedule change detection in the next cycle
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al obtener disponibilidad', err);
        //this.loadingHorarios = false;
        this.canchaData.horariosDisponibles = [];
        this.cdr.markForCheck();
      }
    });
  }

  selectTime(time: TimeOption) {
    if (!this.selectedTime) {
      this.selectedTime = [];
    }

    const index = this.selectedTime.findIndex(t => t.hora === time.hora);

    if (index >= 0) {
      this.selectedTime.splice(index, 1);
    } else {
      this.selectedTime.push(time);
    }
    this.reservaForm.patchValue({ duracion: this.selectedTime.length });
  }

  getFormattedSelectedDate(): string {
    if (!this.selectedDate) return '-';
    return `${this.selectedDate.dia} ${this.selectedDate.numero} de ${this.selectedDate.mes}`;
  }

  calculateTotal(): number {
    if (!this.selectedTime) return 0;
    const duration = this.selectedTime.length || 1;
    const precio = this.canchaData.precio;
    return (precio ?? 0) * duration;
  }

  getMapUrl(): SafeResourceUrl {
    const lat = this.canchaData.latitud || -12.0854;
    const lng = this.canchaData.longitud || -77.0428;
    const url = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  scrollToReserva(sectionClass: string, numberOfTabs: number = 0) {
    this.selectedTabIndex = numberOfTabs;
    setTimeout(() => {
      document.querySelector(sectionClass)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }

  shareCancha() {
    if (navigator.share) {
      navigator.share({
        title: this.canchaData.nombre,
        text: `¡Mira esta increíble cancha! ${this.canchaData.descripcion}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.openSuccessAlert('Enlace copiado al portapapeles');
      });
    }
  }

  openInMaps() {
    const lat = this.canchaData.latitud || -12.0854;
    const lng = this.canchaData.longitud || -77.0428;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  }

  onReservar() {
    if (this.reservaForm.valid && this.selectedDate && this.selectedTime) {
      const reservaData = {
        canchaId: this.canchaData.idCancha,
        cancha: this.canchaData,
        fecha: this.selectedDate.fecha,
        selectedTime: this.selectedTime,
        duracion: this.reservaForm.value.duracion,
        telefono: this.reservaForm.value.telefono,
        precioHora: this.canchaData.precio,
        idTipoDeporte: 1, // TODO: Reemplazar con el ID real del tipo de deporte
        total: this.calculateTotal()
      };
      localStorage.setItem(`reserva_draft_${this.canchaData.idCancha}`, JSON.stringify(reservaData));
      if (!this.authService.isAuthenticated()) {
        // Guardamos la URL a donde debe volver luego del login
        sessionStorage.setItem('redirect_after_login', `/pago?reserva=true`);
        this.router.navigate(['/auth/login']);
        return;
      }

      this.router.navigate(['/pago'], {
        state: { reservaData }
      });
    } else {
      this.openWarningAlert('Por favor completa todos los campos requeridos');
    }
  }


  esFavorito(): boolean {
    if (!this.canchaData?.idCancha) return false;
    return this.canchaFavoritaService.isFavorito(this.canchaData.idCancha);
  }

  async onToggleFavorito(): Promise<void> {
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.openWarningAlert('Debes iniciar sesión para agregar a favoritos');
      return;
    }
    try {
      await this.canchaFavoritaService.toggleFavorito(this.canchaData.idCancha!);
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      this.openErrorAlert('Error al actualizar favoritos. Por favor, intenta nuevamente.');
    }
  }

  goBack(): void {
    this.router.navigate(['/cancha/canchas']);
  }

}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}