import { ChangeDetectorRef, Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
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
import { desagruparHorasPorMediaHora } from '@shared/utils/horario.utils';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
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
    this.checkAndUpdatePhone();

    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private checkAndUpdatePhone(): void {
    if (!this.reservaData || !this.userData) return;

    const reservaTelefono = this.reservaData.telefono?.replace(/\D/g, '');
    const userTelefono = this.userData.telefono?.replace(/\D/g, '');

    if (reservaTelefono !== userTelefono) {
      const subscription = this.usersService
        .updateTelefono({ idUsuario: this.userData.id, telefono: reservaTelefono })
        .pipe(
          tap((response) => {
            if (response.isValid) {
              this.userData!.telefono = reservaTelefono;
              console.log('Teléfono actualizado:', reservaTelefono);
            }
          }),
          takeUntil(this.unsubscribe)
        ).subscribe();
      this.subscriptions.push(subscription);

      this.userData!.telefono = reservaTelefono;
    }
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

    this.isProcessing = true;

    // Desagrupar horarios de vuelta a medias horas
    const horariosDesagrupados = desagruparHorasPorMediaHora(this.reservaData.selectedTime);

    // DTO para crear pre-reserva con EFECTIVO
    const createReservaDto: CreateReserva = {
      idCliente: this.userData.id,
      idCancha: this.reservaData.canchaId,
      fechaReserva: this.reservaData.fecha,
      montoTotal: this.reservaData.total,
      idTipoDeporte: this.reservaData.idTipoDeporte,
      codigoMetodoPago: '02', //SOLO EFECTIVO
      idsHorarioCancha: horariosDesagrupados.map((t: any) => t.idHorarioCancha)
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

    // Formatear horarios
    const horarios = this.reservaData?.selectedTime
      .map((t: any) => t.hora)
      .join(', ');

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
              📱 ${this.reservaData?.telefono || this.userData?.telefono || 'N/A'}
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

  /**
   * Calcular subtotal
   */
  calculateSubtotal(): number {
    if (!this.reservaData) return 0;
    return this.reservaData.precioHora * this.reservaData.duracion;
  }

  override ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    super.ngOnDestroy();
  }
}
