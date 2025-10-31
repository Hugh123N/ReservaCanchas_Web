
import { ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, Output, ViewContainerRef } from '@angular/core';
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


  private unsubscribe = new Subject<void>();

  constructor(private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private usersService: UsersService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('PAGOS', viewContainerRef);
    this.initializeCardForm();
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

  /**
   * Select payment method
   */
  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedMethod = method;

    // Start timer for QR methods
    if (method === 'yape' || method === 'plin') {
      this.startTimer(15 * 60);
    } else {
      this.stopTimer();
      this.cardForm.reset();
    }
  }

  /**
   * Start countdown timer for QR
   */
  private startTimer(seconds: number): void {
    this.stopTimer();

    let remaining = seconds;
    interval(1000)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        remaining--;
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        this.paymentTimer = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (remaining <= 0) {
          this.stopTimer();
        }
      });
  }

  /**
   * Stop timer
   */
  private stopTimer(): void {
    this.paymentTimer = '15:00';
  }

  async onConfirmPayment(): Promise<void> {
    if (!this.selectedMethod || !this.reservaData) {
      return;
    }

    this.isProcessing = true;

    try {
      // 1. El teléfono ya fue validado/actualizado en OnInit

      // 2. Procesar según método de pago
      switch (this.selectedMethod) {
        case 'card':
          await this.processCardPayment();
          break;
        case 'yape':
        case 'plin':
          await this.processQRPayment();
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      this.isProcessing = false;
    }
  }

  private async processCardPayment(): Promise<void> {
    // AQUÍ: Integrar con Niubiz
    // 1. Enviar datos de tarjeta
    // 2. Obtener respuesta de Niubiz
    // 3. Crear reserva en backend

    console.log('Procesando pago con tarjeta...');

    // Simulación
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.navigateToConfirmation('CARD-' + Date.now());
  }

  private async processQRPayment(): Promise<void> {
    // AQUÍ: Integrar con servicio de QR (Yape/Plin)
    // 1. Generar QR
    // 2. Esperar confirmación de pago
    // 3. Crear reserva en backend

    console.log(`Procesando pago con ${this.selectedMethod}...`);

    // Simulación
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.navigateToConfirmation('QR-' + Date.now(), 'pending');
  }

  private navigateToConfirmation(transactionId: string, status: 'confirmed' | 'pending' = 'confirmed'): void {
    // Limpiar localStorage
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
      // Limpiar localStorage
      if (this.reservaData?.canchaId) {
        localStorage.removeItem(`reserva_draft_${this.reservaData.canchaId}`);
      }
      this.router.navigate(['/']);
    }
  }

  /**
   * Format date
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
   * Calculate subtotal
   */
  calculateSubtotal(): number {
    if (!this.reservaData) return 0;
    return this.reservaData.precioHora * this.reservaData.duracion;
  }
  onBack(): void {
    this.router.navigate(['/']);
  }
}
