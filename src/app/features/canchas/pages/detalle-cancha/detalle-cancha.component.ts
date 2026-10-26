import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Components
import { FooterComponent } from '@shared/components/footer/footer.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';

// Material Modules
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
import { agruparHorariosPorHora, agruparHorasConsecutivas, RangoHorario } from '@shared/utils/horario.utils';
import { DateOption } from '../../core/types/date-option';
import { TimeOption } from '../../core/types/time-option.interface';

import { CanchaFavoritaService } from '../../core/services/cancha-favorita.service';
import { HorarioCanchaService } from '../../core/services/horarioCancha.service';
import { ReservaData } from 'app/features/pago/core/types/reserva-data.interface';

@Component({
  selector: 'app-detalle-cancha',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NavVarComponent,
    FooterComponent,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule
  ],
  templateUrl: './detalle-cancha.component.html',
  styleUrl: './detalle-cancha.component.css'
})

export class DetalleCanchaComponent extends BaseComponent implements OnInit, OnDestroy {
  reservaForm: FormGroup;
  canchaId: number = 0;
  selectedTabIndex: number = 0;

  // Selected States
  selectedDate: DateOption | null = null;
  selectedTime: TimeOption[] | null = null;

  // Data
  canchaData: GetCancha;
  horariosDisponibles: TimeOption[] = [];
  loadingHorarios = false;
  horariosVerificados = false;
  errorHorarios: string | null = null;
  avisoHorarios: string | null = null;
  private detalleSubscription?: Subscription;
  private horariosSubscription?: Subscription;

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
      duracion: [1]
    });
  }

  ngOnInit() {
    this.generateAvailableDates();
    const subscription = this.route.params.subscribe(params => {
      this.detalleSubscription?.unsubscribe();
      this.horariosSubscription?.unsubscribe();
      this.canchaId = +params['id'];
      this.canchaData = {} as GetCancha;
      this.selectedDate = null;
      this.selectedTime = null;
      this.horariosDisponibles = [];
      this.horariosVerificados = false;
      this.loadingHorarios = false;
      this.errorHorarios = null;
      this.avisoHorarios = null;
      this.reservaForm.patchValue({ duracion: 0 });

      if (!Number.isSafeInteger(this.canchaId) || this.canchaId <= 0) {
        this.openErrorAlert('El ID de la cancha no es válido.');
        return;
      }

      // Restaurar antes del GET: una respuesta desde caché puede ser inmediata.
      this.restaurarBorrador();
      this.loadingHorarios = this.selectedDate !== null;
      this.loadCanchaData();
    });
    this.subscriptions.push(subscription);
  }

  override ngOnDestroy(): void {
    this.detalleSubscription?.unsubscribe();
    this.horariosSubscription?.unsubscribe();
    super.ngOnDestroy();
  }

  getServiceIconClass(index: number): string {
    return this.iconColorOrder[index % this.iconColorOrder.length];
  }

  loadCanchaData() {
    this.detalleSubscription?.unsubscribe();
    this.detalleSubscription = this.canchasService.get(this.canchaId).subscribe({
      next: (response) => {
        if (response.isValid && response.data) {
          this.canchaData = response.data;
          // Si volvimos desde el pago con una fecha ya elegida, cargar su disponibilidad
          if (this.selectedDate) {
            this.cargarHorariosDisponibles(this.selectedDate);
          }
        } else {
          this.loadingHorarios = false;
          this.openAlert(response);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loadingHorarios = false;
        this.openAlert(err);
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Al volver desde el pago o el historial se restaura fecha/horario desde el
   * borrador para no perder la selección que ya hizo el usuario.
   */
  private restaurarBorrador(): void {
    if (typeof document === 'undefined' || typeof localStorage === 'undefined') return;
    const navigation = this.router.getCurrentNavigation() ?? this.router.lastSuccessfulNavigation;
    const vuelvePorHistorial = navigation?.trigger === 'popstate';
    if (this.route.snapshot.queryParams['reserva'] !== 'true' && !vuelvePorHistorial) return;

    const key = `reserva_draft_${this.canchaId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;

    let draft: Partial<ReservaData>;
    try {
      draft = JSON.parse(raw);
    } catch {
      localStorage.removeItem(key);
      return;
    }

    if (draft?.canchaId !== this.canchaId || typeof draft.fecha !== 'string' ||
        !Array.isArray(draft.selectedTime) || !draft.selectedTime.length ||
        !draft.selectedTime.every(t => t && typeof t.hora === 'string' && /^\d{2}:00$/.test(t.hora))) return;

    const fecha = this.fechasDisponibles.find((f) => f.fecha === draft.fecha);
    if (!fecha) return;

    this.selectedDate = fecha;
    this.selectedTime = draft.selectedTime;
    this.reservaForm.patchValue({ duracion: draft.selectedTime.length });

    this.scrollToHorarios(350);
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
    return this.selectedDate && this.horariosVerificados ? this.horariosDisponibles : [];
  }

  get puedeContinuar(): boolean {
    return !!this.canchaData.idCancha && !!this.selectedDate && !!this.selectedTime?.length &&
      this.horariosVerificados && !this.loadingHorarios && !this.errorHorarios;
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

  esHoraSeleccionada(time: TimeOption): boolean {
    return !!this.selectedTime?.some(t => t.hora === time.hora);
  }

  selectDate(fecha: DateOption) {
    this.selectedDate = fecha;
    this.selectedTime = null; // Reset selected time
    this.reservaForm.patchValue({ duracion: 0 });

    this.scrollToHorarios();
    this.cargarHorariosDisponibles(fecha);
  }

  private cargarHorariosDisponibles(fecha: DateOption) {
    if (!this.canchaData.idCancha) return;
    this.horariosSubscription?.unsubscribe();
    const body: RequestDisponibilidad = {
      idCancha: this.canchaData.idCancha!,
      fecha: fecha.fecha
    };

    this.loadingHorarios = true;
    this.horariosVerificados = false;
    this.horariosDisponibles = [];
    this.errorHorarios = null;
    this.avisoHorarios = null;

    this.horariosSubscription = this.horarioCanchaService.horarioDisponible(body).subscribe({
      next: (res) => {
        this.loadingHorarios = false;
        if (res.isValid && Array.isArray(res.data)) {
          this.horariosDisponibles = agruparHorariosPorHora(res.data);
          this.horariosVerificados = true;
          this.reconciliarSeleccion();
        } else {
          this.errorHorarios = 'No pudimos verificar los horarios. Intenta nuevamente.';
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al obtener disponibilidad', err);
        this.loadingHorarios = false;
        this.errorHorarios = 'No pudimos verificar los horarios. Intenta nuevamente.';
        this.cdr.markForCheck();
      }
    });
  }

  reintentarHorarios(): void {
    if (this.selectedDate) this.cargarHorariosDisponibles(this.selectedDate);
  }

  private reconciliarSeleccion(): void {
    const anteriores = this.selectedTime ?? [];
    const horasSeleccionadas = new Set(anteriores.map(t => t.hora));
    this.selectedTime = this.horariosDisponibles.filter(t => horasSeleccionadas.has(t.hora));
    this.reservaForm.patchValue({ duracion: this.selectedTime.length });

    const retiradas = anteriores.filter(t => !this.selectedTime?.some(actual => actual.hora === t.hora));
    const cambioPrecio = this.selectedTime.some(actual =>
      anteriores.some(anterior => anterior.hora === actual.hora && anterior.precio !== actual.precio)
    );
    const avisos: string[] = [];
    if (retiradas.length) {
      avisos.push(`Estos horarios ya no están disponibles y se retiraron de tu selección: ${retiradas.map(t => t.hora).join(', ')}.`);
    }
    if (cambioPrecio) avisos.push('Se actualizaron los precios de tu selección. Revisa el nuevo total.');
    this.avisoHorarios = avisos.join(' ') || null;
  }

  private scrollToHorarios(delay: number = 100) {
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      document.querySelector('.time-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, delay);
  }

  selectTime(time: TimeOption) {
    if (!this.horariosVerificados || this.loadingHorarios) return;
    const disponible = this.horariosDisponibles.find(t => t.hora === time.hora);
    if (!disponible) return;
    if (!this.selectedTime) {
      this.selectedTime = [];
    }

    const index = this.selectedTime.findIndex(t => t.hora === time.hora);

    if (index >= 0) {
      this.selectedTime.splice(index, 1);
    } else {
      this.selectedTime.push(disponible);
    }
    this.reservaForm.patchValue({ duracion: this.selectedTime.length });

    // Scroll al inicio del formulario de reserva
    this.scrollToHorarios(50);
  }

  getFormattedSelectedDate(): string {
    if (!this.selectedDate) return '-';
    return `${this.selectedDate.dia} ${this.selectedDate.numero} de ${this.selectedDate.mes}`;
  }

  /** Mes y año mostrado en el encabezado de selección de días */
  get mesAnio(): string {
    const fecha = this.selectedDate?.fecha ?? this.fechasDisponibles[0]?.fecha;
    if (!fecha) return '';
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return new Date(anio, (mes || 1) - 1, dia || 1).toLocaleDateString('es-PE', {
      month: 'long',
      year: 'numeric'
    });
  }

  get subtituloHorario(): string {
    if (!this.selectedDate) return 'Puedes marcar varias horas';
    const cuando =
      this.selectedDate.dia === 'Hoy'
        ? 'hoy'
        : this.selectedDate.dia === 'Mañana'
          ? 'mañana'
          : `${this.selectedDate.dia} ${this.selectedDate.numero}`;
    return `Disponibles para ${cuando} · Puedes marcar varias horas`;
  }

  get hayHorariosDisponibles(): boolean {
    return this.getAvailableHours().length > 0;
  }

  /** Horas disponibles agrupadas por franja del día (Mañana/Tarde/Noche) */
  get gruposHorario(): { nombre: string; icono: string; rango: string; horas: TimeOption[] }[] {
    const esManana = (h: string) => +h.substring(0, 2) < 12;
    const esTarde = (h: string) => +h.substring(0, 2) >= 12 && +h.substring(0, 2) < 18;
    const esNoche = (h: string) => +h.substring(0, 2) >= 18;
    const franjas = [
      { nombre: 'Mañana', icono: 'wb_twilight', test: esManana },
      { nombre: 'Tarde', icono: 'wb_sunny', test: esTarde },
      { nombre: 'Noche', icono: 'nights_stay', test: esNoche }
    ];
    const disponibles = this.getAvailableHours();

    return franjas
      .map(franja => {
        const horas = disponibles.filter(h => franja.test(h.hora));
        return { nombre: franja.nombre, icono: franja.icono, horas, rango: this.rangoDeHoras(horas) };
      })
      .filter(franja => franja.horas.length > 0);
  }

  /** Bloques seleccionados consecutivos con su cantidad de horas */
  get rangosSeleccionados(): (RangoHorario & { horas: number })[] {
    const horas = (this.selectedTime ?? []).map(t => t.hora);
    return agruparHorasConsecutivas(horas).map(rango => ({
      ...rango,
      horas: horas.filter(h => h >= rango.inicio && h < rango.fin).length
    }));
  }

  quitarRango(rango: RangoHorario): void {
    if (!this.selectedTime) return;
    this.selectedTime = this.selectedTime.filter(t => t.hora < rango.inicio || t.hora >= rango.fin);
    this.reservaForm.patchValue({ duracion: this.selectedTime.length });
  }

  private rangoDeHoras(horas: TimeOption[]): string {
    if (!horas.length) return '';
    const primera = horas[0].hora;
    const [hh, mm] = horas[horas.length - 1].hora.split(':');
    const fin = String((Number(hh) + 1) % 24).padStart(2, '0');
    return `${primera} – ${fin}:${mm}`;
  }

  calculateTotal(): number {
    if (!this.horariosVerificados) return 0;
    return (this.selectedTime ?? []).reduce((total, t) => total + (t.precio ?? this.canchaData.precio ?? 0), 0);
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
    if (this.selectedDate && this.selectedTime?.length && this.puedeContinuar) {
      const reservaData: ReservaData = {
        canchaId: this.canchaData.idCancha,
        cancha: this.canchaData,
        fecha: this.selectedDate.fecha,
        selectedTime: this.selectedTime,
        duracion: this.reservaForm.value.duracion,
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
      this.openWarningAlert(this.selectedDate && !this.horariosVerificados
        ? 'Es necesario verificar la disponibilidad de los horarios antes de continuar.'
        : 'Selecciona una fecha y al menos un horario para continuar');
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
