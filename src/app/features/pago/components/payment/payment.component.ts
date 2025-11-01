
import { ChangeDetectorRef, Component, Inject, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseComponent } from '@base/components/base-component/base.component';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { UsersService } from '../../../auth/services/users.service';
import { interval, Subject, takeUntil, tap } from 'rxjs';
import { MatFormField } from '@angular/material/select';
import { MatLabel } from '@angular/material/select';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from 'app/features/auth/models/user';
import { ReservaService } from 'app/features/reserva/core/services/reserva.service';
import { PagoService } from '../../core/services/pago.service';
import { CreateReserva } from 'app/features/reserva/core/model/createReserva.model';
import { ReservaConPagoDto } from 'app/features/reserva/core/model/reservaConPago.model';
import { ConfirmarPago } from '../../core/model/confirmarPago.model';

interface ReservaData {
  canchaId: number;
  cancha?: any;
  fecha: string;
  selectedTime: any;
  duracion: number;
  telefono: string;
  precioHora: number;
  total: number;
}

type PaymentMethod = 'card' | 'yape' | 'plin';



@Component({
  selector: 'app-payment',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatFormField,
    MatLabel,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent extends BaseComponent implements OnInit {

  userData: User | null = null;
  reservaData: ReservaData = {
    canchaId: 0,
    fecha: '',
    selectedTime: null,
    duracion: 1,
    telefono: '',
    precioHora: 0,
    total: 0
  };

  // States
  selectedMethod: PaymentMethod | null = null;
  isLoading: boolean = false;
  isProcessing: boolean = false;
  paymentTimer: string = '15:00';
  cardForm!: FormGroup;
  operationCodeForm!: FormGroup;

  // Pago data
  reservaConPagoDto: ReservaConPagoDto | null = null;
  qrCodeImage: string | null = null;
  showOperationCodeInput: boolean = false;

  private unsubscribe = new Subject<void>();

  constructor(private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private usersService: UsersService,
    private reservaService: ReservaService,
    private pagoService: PagoService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('PAGOS', viewContainerRef);
    this.initializeCardForm();
    this.initializeOperationCodeForm();
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
        .pipe(tap((response) => {
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




  private initializeCardForm(): void {
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(16)]],
      cardHolder: ['', [Validators.required, Validators.minLength(3)]],
      cardExpiry: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cardCvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });
  }

  private initializeOperationCodeForm(): void {
    this.operationCodeForm = this.fb.group({
      codigoOperacion: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(10),
        Validators.pattern(/^[A-Za-z0-9]+$/)
      ]]
    });
  }

  /**
   * Select payment method
   */
  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedMethod = method;
    this.showOperationCodeInput = false;
    this.operationCodeForm.reset();
    this.reservaConPagoDto = null;
    this.qrCodeImage = null;

    if (method === 'card') {
      this.cardForm.reset();
    }
  }

  /**
   * Start countdown timer for QR
   */
  private startTimer(fechaExpiracion: string): void {
    const timerSubscription = interval(1000)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        const now = new Date().getTime();
        const expiry = new Date(fechaExpiracion).getTime();
        const remaining = Math.floor((expiry - now) / 1000);

        if (remaining <= 0) {
          this.paymentTimer = '00:00';
          this.onPaymentExpired();
        } else {
          const mins = Math.floor(remaining / 60);
          const secs = remaining % 60;
          this.paymentTimer = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
      });

    this.subscriptions.push(timerSubscription);
  }

  /**
   * Stop timer
   */
  private stopTimer(): void {
    this.unsubscribe.next();
    this.paymentTimer = '15:00';
  }

  /**
   * Handle payment expiration
   */
  private onPaymentExpired(): void {
    this.stopTimer();
    this.openSweetAlert('El tiempo de pago ha expirado', 'Por favor, vuelve a intentar crear la reserva.', 'error');
    this.selectedMethod = null;
    this.reservaConPagoDto = null;
    this.qrCodeImage = null;
  }

  /**
   * Iniciar proceso de pago - Crear reserva
   */
  async onConfirmPayment(): Promise<void> {
    if (!this.selectedMethod || !this.reservaData || !this.userData) {
      return;
    }

    // Si ya existe una reserva creada y es método QR, mostrar input de código
    if (this.reservaConPagoDto && (this.selectedMethod === 'yape' || this.selectedMethod === 'plin')) {
      this.showOperationCodeInput = true;
      return;
    }

    this.isProcessing = true;

    try {
      // Procesar según método de pago
      switch (this.selectedMethod) {
        case 'card':
          await this.processCardPayment();
          break;
        case 'yape':
        case 'plin':
          await this.createReservaWithQR();
          break;
      }
    } catch (error: any) {
      console.error('Error:', error);
      this.openSweetAlert('Error al procesar el pago', error?.message || 'Ocurrió un error inesperado', 'error');
      this.isProcessing = false;
    }
  }

  /**
   * Crear reserva con método de pago Yape/Plin
   */
  private async createReservaWithQR(): Promise<void> {
    if (!this.reservaData || !this.userData || !this.selectedMethod) {
      return;
    }

    const codigoMetodoPago = this.selectedMethod === 'yape' ? '04' : '05';

    const detalles = this.reservaData.selectedTime.map((t: any) => {
      const [hours, minutes] = t.hora.split(':').map(Number);

      const horaInicio = t.hora;
      const horaFinDate = new Date();
      horaFinDate.setHours(hours + 1, minutes, 0);

      const horaFin = horaFinDate.toTimeString().slice(0, 5); // HH:mm

      return {
        horaInicio,
        horaFin
      };
    });
    //debugger;
    const createReservaDto: CreateReserva = {
      idUsuario: this.userData.id,
      idCancha: this.reservaData.canchaId,
      fecha: this.reservaData.fecha,
      monto: this.reservaData.total,
      idEstadoReserva: 1, // PENDIENTE
      codigoMetodoPago: codigoMetodoPago,
      detalles
    };

    const subscription = this.reservaService.create(createReservaDto)
      .pipe(
        tap((response) => {
          if (response.isValid && response.data) {
            this.reservaConPagoDto = response.data;

            // Configurar QR Code
            if (this.reservaConPagoDto?.qrCodeBase64) {
              this.qrCodeImage = `data:image/png;base64,${this.reservaConPagoDto.qrCodeBase64}`;
            }

            // Iniciar temporizador
            if (this.reservaConPagoDto?.fechaExpiracion) {
              this.startTimer(this.reservaConPagoDto.fechaExpiracion);
            }

            this.openSuccessAlert(response || 'Reserva creada. Escanea el código QR para pagar');
            this.showOperationCodeInput = false;
            this.isProcessing = false;
            this.cdr.markForCheck();
          } else {
            this.openErrorAlert(response || 'Error al crear la reserva');
            this.isProcessing = false;
          }
        }),
        takeUntil(this.unsubscribe)
      ).subscribe({
        error: (error) => {
          this.openErrorAlert(error || 'Error al crear la reserva. Ocurrió un error inesperado');
          this.isProcessing = false;
        }
      });

    this.subscriptions.push(subscription);
  }

  /**
   * Confirmar pago con código de operación
   */
  onConfirmOperationCode(): void {
    if (!this.operationCodeForm.valid || !this.reservaConPagoDto) {
      this.openWarningAlert('Por favor ingresa un código de operación válido (6-10 caracteres alfanuméricos)');
      return;
    }

    this.isProcessing = true;

    const confirmarPagoDto: ConfirmarPago = {
      idPago: this.reservaConPagoDto.pago.idPago,
      codigoOperacion: this.operationCodeForm.value.codigoOperacion.toUpperCase()
    };

    const subscription = this.pagoService.confirmarPago(confirmarPagoDto)
      .pipe(
        tap((response) => {
          if (response.isValid && response.data) {
            this.stopTimer();
            this.openSuccessAlert(`Tu reserva ha sido confirmada exitosamente. Código: ${response.data.codigoOperacion}`);

            // Navegar a confirmación
            setTimeout(() => {
              this.navigateToConfirmation(response.data!.codigoOperacion || 'CONFIRMED');
            }, 2000);
          } else {
            this.openErrorAlert(response || 'Error al confirmar el pago');
            this.isProcessing = false;
          }
        }),
        takeUntil(this.unsubscribe)
      ).subscribe({
        error: (error) => {
          this.openErrorAlert(error || 'Error al confirmar el pago. Verifica el código de operación e intenta nuevamente');
          this.isProcessing = false;
        }
      });

    this.subscriptions.push(subscription);
  }

  /**
   * Calcular hora fin
   */
  private calculateEndTime(): string {
    if (!this.reservaData.selectedTime?.hora) {
      return '';
    }

    const [hours, minutes] = this.reservaData.selectedTime.hora.split(':');
    const startHour = parseInt(hours);
    const endHour = startHour + this.reservaData.duracion;

    return `${endHour.toString().padStart(2, '0')}:${minutes}:00`;
  }

  private async processCardPayment(): Promise<void> {
    console.log('Procesando pago con tarjeta...');
    this.openWarningAlert('El pago con tarjeta aún no está disponible. Por favor usa Yape o Plin.');
    this.isProcessing = false;
  }

  private navigateToConfirmation(transactionId: string, status: 'confirmed' | 'pending' = 'confirmed'): void {
    if (this.reservaData?.canchaId) {
      localStorage.removeItem(`reserva_draft_${this.reservaData.canchaId}`);
    }

    this.router.navigate(['/reserva-confirmada'], {
      state: {
        transactionId,
        status,
        reservaData: this.reservaData,
        paymentMethod: this.selectedMethod
      }
    });
  }

  onCancel(): void {
    if (confirm('¿Estás seguro de cancelar esta reserva?')) {
      if (this.reservaData?.canchaId) {
        localStorage.removeItem(`reserva_draft_${this.reservaData.canchaId}`);
      }
      this.router.navigate(['/']);
    }
  }

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

  calculateSubtotal(): number {
    if (!this.reservaData) return 0;
    return this.reservaData.precioHora * this.reservaData.duracion;
  }
  onBack(): void {
    this.router.navigate(['/']);
  }

  override ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    super.ngOnDestroy(); 
  }

  getButtonText(): string {
    if (!this.selectedMethod) return 'Selecciona un método de pago';
    if (this.isProcessing) return 'Procesando...';

    if ((this.selectedMethod === 'yape' || this.selectedMethod === 'plin') && !this.reservaConPagoDto) {
      return 'Generar QR de Pago';
    }

    if (this.reservaConPagoDto && this.showOperationCodeInput) {
      return 'Confirmar Código de Operación';
    }

    return 'Confirmar Pago';
  }
}
