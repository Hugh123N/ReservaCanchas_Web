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
import { DisponibilidadService } from '../../core/services/disponibilidad.service';
import { RequestDisponibilidad } from '../../core/model/disponibilidad/requestDisponibilidad.model';
import { AuthService } from '@core/auth/services/auth.service';
import { DateOption } from '../../core/types/date-option';

interface TimeOption {
  hora: string;
}

interface ServiceItem {
  name: string;
  icon: string;
  iconClass: string;
}

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
  isFavorite: boolean = false;

  // Data
  canchaData: GetCancha;

  // Available dates (next 7 days)
  fechasDisponibles: DateOption[] = [];

  // Services offered
  services: ServiceItem[] = [
    { name: 'Torneos', icon: 'emoji_events', iconClass: 'icon-accent' },
    { name: 'Cafetería', icon: 'local_cafe', iconClass: 'icon-secondary' },
    { name: 'Estacionamiento', icon: 'local_parking', iconClass: 'icon-primary' },
    { name: 'Implementos', icon: 'sports_soccer', iconClass: 'icon-accent' },
    { name: 'Vestuarios', icon: 'wc', iconClass: 'icon-secondary' },
    { name: 'Duchas', icon: 'shower', iconClass: 'icon-primary' },
    { name: 'Iluminación LED', icon: 'lightbulb', iconClass: 'icon-accent' },
    { name: 'WiFi Gratis', icon: 'wifi', iconClass: 'icon-secondary' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private canchasService: CanchaService,
    private disponibilidadService: DisponibilidadService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
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
    const idCancha = Number(this.route.snapshot.paramMap.get('id'));

    this.route.params.subscribe(params => {
      this.canchaId = +params['id'];
      this.loadCanchaData();
    });
    // Generate available dates
    this.generateAvailableDates();
    var telefono = this.authService.loadUserProfile()?.telefono ?? null;
    this.reservaForm.patchValue({ telefono: telefono });
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
    const today = new Date();
    this.fechasDisponibles = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      this.fechasDisponibles.push({
        dia: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : dayNames[date.getDay()],
        numero: date.getDate().toString().padStart(2, '0'),
        mes: monthNames[date.getMonth()],
        fecha: formatDateLocal(date),
      });
    }
  }

  getAvailableHours(): TimeOption[] {
    if (!this.selectedDate || !this.canchaData.horariosDisponibles) {
      return [];
    }

    return this.canchaData.horariosDisponibles.map(hora => ({
      hora
    }));
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
      return `${this.canchaData.direccion || this.canchaData.ubicacion}`;
    }
    return this.canchaData.direccion || this.canchaData.ubicacion || 'Dirección no disponible';
  }

  getSportIcon(): string {
    const sport = this.canchaData.tipoCancha?.nombre?.toLowerCase() || '';
    if (sport.includes('futbol')) return 'sports_soccer';
    if (sport.includes('basquet')) return 'sports_basketball';
    if (sport.includes('tenis')) return 'sports_tennis';
    if (sport.includes('voley')) return 'sports_volleyball';
    return 'sports';
  }
  getStatusText(): string {
    return this.canchaData.estadoCancha?.nombre || 'Disponible';
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

    this.disponibilidadService.horarioDisponible(body).subscribe({
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
    const precio = this.canchaData.precioHora;
    return (precio ?? 0) * duration;
  }

  getMapUrl(): SafeResourceUrl {
    const lat = this.canchaData.latitud || -12.0854;
    const lng = this.canchaData.longitud || -77.0428;
    const url = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  scrollToReserva() {
    this.selectedTabIndex = 0;
    setTimeout(() => {
      document.querySelector('.date-section')?.scrollIntoView({
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
        alert('Enlace copiado al portapapeles');
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
        fecha: this.selectedDate.fecha,
        selectedTime: this.selectedTime,
        duracion: this.reservaForm.value.duracion,
        telefono: this.reservaForm.value.telefono,
        recordatorioWhatsApp: this.reservaForm.value.recordatorioWhatsApp,
        precioHora: this.canchaData.precioHora,
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
      alert('Por favor completa todos los campos requeridos');
    }
  }


  // Toggle favorite status
  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    // In a real app, this would call a service to update favorites
    console.log('Favorite toggled:', this.isFavorite);
  }
  
}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}