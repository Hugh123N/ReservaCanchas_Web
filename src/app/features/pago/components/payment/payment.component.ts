import { ChangeDetectorRef, Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseComponent } from '@base/components/base-component/base.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { UsersService } from '../../../auth/services/users.service';
import { Subject, takeUntil, tap } from 'rxjs';
import { User } from 'app/features/auth/models/user';
import { ReservaService } from 'app/features/reserva/core/services/reserva.service';
import { CreateReserva } from 'app/features/reserva/core/model/createReserva.model';
import { ReservaConPagoDto } from 'app/features/reserva/core/model/reservaConPago.model';
import { ReservaData } from '../../core/types/reserva-data.interface';
import { REGLAS_CANCHA_GENERALES, ReglaCancha } from '../../core/constants/reglas-cancha.constants';
import { desagruparHorasPorMediaHora, formatHorasConsecutivas } from '@shared/utils/horario.utils';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent extends BaseComponent implements OnInit {

  userData: User | null = null;
  reservaData: ReservaData | null = null;

  // States
  isLoading: boolean = false;
  isProcessing: boolean = false;
  reglasExpandidas: boolean = false;
  reglasAceptadas: boolean = false;

  // Información de contacto (solo el teléfono es editable)
  telefonoContacto: string = '';
  telefonoInvalido: boolean = false;
  telefonoEstado: 'inicial' | 'guardando' | 'guardado' | 'error' = 'inicial';

  readonly reglas: ReglaCancha[] = REGLAS_CANCHA_GENERALES;
  private readonly reglasVisiblesColapsadas = 3;

  private unsubscribe = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private usersService: UsersService,
    private reservaService: ReservaService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('PAGOS', viewContainerRef);
  }

  ngOnInit(): void {
    this.loadReservationData();
  }

  get reglasAMostrar(): ReglaCancha[] {
    return this.reglasExpandidas
      ? this.reglas
      : this.reglas.slice(0, this.reglasVisiblesColapsadas);
  }

  get hayMasReglas(): boolean {
    return this.reglas.length > this.reglasVisiblesColapsadas;
  }

  /** Horas seleccionadas unificadas en rangos: "07:00 - 09:00, 11:00 - 13:00" */
  get horarioAgrupado(): string {
    const horas = this.reservaData?.selectedTime?.map((t) => t.hora) ?? [];
    return formatHorasConsecutivas(horas);
  }

  get precioHoraUniforme(): number | null {
    const reserva = this.reservaData;
    if (!reserva) return null;
    const precios = reserva.selectedTime.map(t => t.precio ?? reserva.precioHora);
    return precios.length > 0 && precios.every(precio => precio === precios[0]) ? precios[0] : null;
  }

  toggleReglas(): void {
    this.reglasExpandidas = !this.reglasExpandidas;
  }

  get mensajeTelefono(): string {
    switch (this.telefonoEstado) {
      case 'guardando':
        return 'Guardando número en tu perfil…';
      case 'guardado':
        return 'Número actualizado en tu perfil.';
      case 'error':
        return 'No se pudo guardar el número. Verifícalo e inténtalo de nuevo.';
      default:
        return 'Te contactaremos por este número. Se guarda en tu perfil al salir del campo.';
    }
  }

  onTelefonoInput(): void {
    this.telefonoInvalido = false;
    if (this.telefonoEstado !== 'guardando') {
      this.telefonoEstado = 'inicial';
    }
  }

  onTelefonoBlur(): void {
    const telefono = this.normalizarTelefono(this.telefonoContacto);
    this.telefonoContacto = telefono;
    this.telefonoInvalido = !this.esTelefonoValido(telefono);

    if (this.telefonoInvalido || !this.userData) {
      this.telefonoEstado = 'inicial';
      return;
    }

    if (telefono === this.normalizarTelefono(this.userData.telefono)) {
      this.telefonoEstado = 'inicial';
      return;
    }

    this.guardarTelefono(telefono);
  }

  private guardarTelefono(telefono: string): void {
    this.telefonoEstado = 'guardando';
    this.cdr.markForCheck();

    const subscription = this.usersService
      .updateTelefono({ idUsuario: this.userData!.id, telefono })
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (response) => {
          if (response.isValid) {
            this.userData!.telefono = telefono;
            this.telefonoEstado = 'guardado';
          } else {
            this.telefonoEstado = 'error';
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.telefonoEstado = 'error';
          this.cdr.markForCheck();
        }
      });

    this.subscriptions.push(subscription);
  }

  private normalizarTelefono(telefono: string | null | undefined): string {
    return (telefono ?? '').replace(/\D/g, '');
  }

  private esTelefonoValido(telefono: string): boolean {
    return /^\d{8,15}$/.test(telefono);
  }

  private loadReservationData(): void {
    this.isLoading = true;

    // 1. Intentar obtener desde navigation state
    const navigationState = typeof window !== 'undefined' ? window.history.state : null;
    if (navigationState?.reservaData) {
      this.reservaData = navigationState.reservaData;
      this.processReservationData();
      return;
    }

    // 2. Si no, buscar en localStorage (viene del modal)
    this.route.queryParams.subscribe(params => {
      if (params['reserva'] === 'true') {
        const canchaId = this.findLatestReservation();
        if (canchaId) {
          const storedData = localStorage.getItem(`reserva_draft_${canchaId}`);
          if (storedData) {
            this.reservaData = JSON.parse(storedData);
            this.processReservationData();
            return;
          }
        }
      }

      // No se encontró data
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  private processReservationData(): void {
    if (!this.reservaData) {
      this.isLoading = false;
      return;
    }

    this.loadUserData();
  }

  private loadUserData(): void {
    if (!this.authService.isAuthenticated()) {
      this.isLoading = false;
      return;
    }

    var user = this.authService.loadUserProfile();
    if (!user) {
      this.isLoading = false;
      return;
    }
    this.userData = user;
    this.telefonoContacto = user.telefono || this.reservaData?.telefono || '';

    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private findLatestReservation(): number | null {
    const keys = Object.keys(localStorage);
    const reservaKeys = keys.filter(key => key.startsWith('reserva_draft_'));

    if (reservaKeys.length === 0) return null;

    // Retornar el más reciente (último guardado)
    const lastKey = reservaKeys[reservaKeys.length - 1];
    return parseInt(lastKey.replace('reserva_draft_', ''));
  }

  /**
   * Crear pre-reserva con pago en EFECTIVO
   * Este es el único método de pago aceptado para clientes
   */
  onConfirmPreReserva(): void {
    if (!this.reservaData || !this.userData) {
      this.openWarningAlert('No se encontraron datos de la reserva o del usuario');
      return;
    }

    const telefono = this.normalizarTelefono(this.telefonoContacto);
    if (!this.esTelefonoValido(telefono)) {
      this.telefonoInvalido = true;
      this.openWarningAlert('Ingresa un teléfono de contacto válido');
      return;
    }
    this.telefonoContacto = telefono;

    this.isProcessing = true;

    // Desagrupar horarios de vuelta a medias horas
    const horariosDesagrupados = desagruparHorasPorMediaHora(this.reservaData.selectedTime);

    // DTO para crear pre-reserva con EFECTIVO
    const createReservaDto: CreateReserva = {
      idCliente: this.userData.idUserNegocio,
      idCancha: this.reservaData.canchaId,
      fechaReserva: this.reservaData.fecha,
      montoTotal: this.reservaData.total,
      idTipoDeporte: this.reservaData.idTipoDeporte,
      codigoMetodoPago: '02', //SOLO EFECTIVO
      idsHorarioCancha: horariosDesagrupados.map(t => t.idHorarioCancha)
    };

    const subscription = this.reservaService.create(createReservaDto)
      .pipe(
        tap((response) => {
          if (response.isValid && response.data) {
            this.isProcessing = false;
            this.showPreReservaSuccessModal(response.data);
          } else {
            this.openErrorAlert(response || 'Error al crear la pre-reserva');
            this.isProcessing = false;
          }
        }),
        takeUntil(this.unsubscribe)
      ).subscribe({
        error: (error) => {
          this.openErrorAlert(error || 'Error al crear la pre-reserva. Ocurrió un error inesperado');
          this.isProcessing = false;
        }
      });

    this.subscriptions.push(subscription);
  }

  /**
   * Modal de éxito con toda la información de la pre-reserva
   */
  private showPreReservaSuccessModal(data: ReservaConPagoDto): void {
    // Formatear fecha de expiración
    const fechaExpiracion = data.fechaExpiracionPreReserva
      ? this.formatDateTime(data.fechaExpiracionPreReserva)
      : 'No especificada';

    // Calcular horas restantes
    const horasRestantes = data.duracionPreReservaHoras || 24;

    const fechaReserva = this.formatDate(this.reservaData?.fecha ?? '');

    Swal.fire({
      icon: 'success',
      title: '¡Reserva Creada Exitosamente!',
      html: `
        <div style="text-align: left; padding: 1rem;">
          <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #0ea5e9;">
            <h4 style="margin: 0 0 0.5rem 0; color: #0369a1; font-size: 1.1rem;">
              Código de Reserva
            </h4>
            <p style="margin: 0; font-size: 1.5rem; font-weight: bold; color: #0c4a6e;">
              ${data.codigoReserva || 'N/A'}
            </p>
          </div>

          <div style="background: #ecfeff; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #06b6d4;">
            <h4 style="margin: 0 0 0.5rem 0; color: #0e7490;">Tu reserva</h4>
            <p style="margin: 0.25rem 0;">
              <strong>Fecha:</strong> ${fechaReserva}
            </p>
            <p style="margin: 0.25rem 0;">
              <strong>Horario:</strong> ${this.horarioAgrupado}
            </p>
          </div>

          <div style="background: #fef3c7; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #f59e0b;">
            <h4 style="margin: 0 0 0.5rem 0; color: #92400e;">IMPORTANTE</h4>
            <p style="margin: 0.25rem 0;">Tu reserva expirará el:</p>
            <p style="margin: 0.25rem 0; font-weight: bold; font-size: 1.1rem; color: #78350f;">
              ${fechaExpiracion}
            </p>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #92400e;">
              Tienes <strong>${horasRestantes} horas</strong> para que el operador confirme tu reserva
            </p>
          </div>

          <div style="background: #f0fdf4; padding: 1rem; border-radius: 8px; border-left: 4px solid #10b981;">
            <h4 style="margin: 0 0 0.5rem 0; color: #065f46;">Próximos Pasos</h4>
            <p style="margin: 0.25rem 0;">El operador de la cancha se contactará contigo al:</p>
            <p style="margin: 0.25rem 0; font-size: 1.2rem; font-weight: bold; color: #047857;">
              📱 ${this.telefonoContacto || this.userData?.telefono || 'N/A'}
            </p>
            ${data.telefonoCancha ? `
              <p style="margin: 0.5rem 0 0 0; padding-top: 0.5rem; border-top: 1px solid #d1fae5;">
                También puedes contactar a la cancha al: <strong>${data.telefonoCancha}</strong>
              </p>
            ` : ''}
          </div>
        </div>
      `,
      width: '650px',
      confirmButtonText: 'Ver Mis Reservas',
      confirmButtonColor: '#10b981',
      showCancelButton: true,
      cancelButtonText: 'Ir al Inicio',
      cancelButtonColor: '#6b7280',
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: 'pre-reserva-modal',
        confirmButton: 'btn-primary-large',
        title: 'swal-title-custom'
      }
    }).then((result) => {
      // Limpiar localStorage
      if (this.reservaData?.canchaId) {
        localStorage.removeItem(`reserva_draft_${this.reservaData.canchaId}`);
      }

      // Redirigir según botón presionado
      if (result.isConfirmed) {
        // Ver Mis Reservas
        this.router.navigate(['/mis-reservas']);
      } else {
        // Ir al Inicio
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * Cancelar y volver
   */
  onCancel(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se perderán los datos de la reserva',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver'
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.reservaData?.canchaId) {
          localStorage.removeItem(`reserva_draft_${this.reservaData.canchaId}`);
        }
        this.router.navigate(['/cancha/', this.reservaData?.canchaId]);
      }
    });
  }

  /**
   * Volver atrás
   */
  onBack(): void {
    this.router.navigate(['/cancha/', this.reservaData?.canchaId], {
      queryParams: { reserva: 'true' }
    });
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('es-PE', options);
  }

  /**
   * Formatear fecha y hora completa
   */
  formatDateTime(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-PE', options);
  }

  override ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    super.ngOnDestroy();
  }
}
