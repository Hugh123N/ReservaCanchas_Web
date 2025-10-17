import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseComponent } from '@base/components/base-component/base.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { UsersService } from '../../../auth/services/users.service';
import { interval, Subject, takeUntil } from 'rxjs';





interface ReservaData {
  canchaId: number;
  cancha?: any;
  fecha: string;
  selectedTime: any;
  duracion: number;
  telefono: string;
  recordatorioWhatsApp: boolean;
  precioHora: number;
  total: number;
}

interface UserData {
  id: string;
  email: string;
  telefono?: string;
  firstName?: string;
  lastName?: string;
}

type PaymentMethod = 'card' | 'yape' | 'plin' | 'transfer' | 'local';



@Component({
  selector: 'app-payment',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    NavVarComponent,
    FooterComponent
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent extends BaseComponent implements OnInit, OnDestroy{
  
  // Data
  reservaData: ReservaData | null = null;
  userData: UserData | null = null;
  
  // States
  isLoading: boolean = true;
  isProcessing: boolean = false;
  selectedPaymentMethod: PaymentMethod | null = null;
  phoneNeedsUpdate: boolean = false;
  
  // Timer for QR codes
  paymentTimer: string = '15:00';
  private timerSubscription: any;
  
  // Voucher
  voucherFile: File | null = null;
  
  private unsubscribe: Subject<any>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private usersService: UsersService,
    // private paymentService: PaymentService,
    // private reservaService: ReservaService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super("PAYMENT", viewContainerRef);
    this.unsubscribe = new Subject<any>();
  }

  ngOnInit(): void {
    this.loadReservationData();
  }

  override ngOnDestroy(): void {
    this.stopTimer();
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }

  private loadReservationData(): void {
    this.isLoading = true;

    const navigationState = history.state;
    if (navigationState?.reservaData) {
      this.reservaData = navigationState.reservaData;
      this.processReservationData();
      return;
    }

    this.route.queryParams.subscribe(params => {
      if (params['reserva'] === 'true') {
        // Buscar la última reserva guardada
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
      
      // No se encontró data de reserva
      this.isLoading = false;
      this.cdr.markForCheck();
    });
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
   * Process reservation data and check user phone
   */
  private processReservationData(): void {
    if (!this.reservaData) {
      this.isLoading = false;
      return;
    }

    // Obtener datos del usuario actual
    this.loadUserData();
  }

  /**
   * Load current user data
   */
  private loadUserData(): void {
    if (!this.authService.isAuthenticated()) {
      this.isLoading = false;
      return;
    }

    // Aquí obtendrías los datos del usuario del servicio
    // Por ahora simulamos
    this.userData = {
      id: 'user-123',
      email: 'user@email.com',
      telefono: '987654321',
      firstName: 'Juan',
      lastName: 'Pérez'
    };

    // Verificar si el teléfono necesita actualizarse
    this.checkPhoneUpdate();
    
    this.isLoading = false;
    this.cdr.markForCheck();

    /* Implementación real:
    const subscription = this.usersService
      .getCurrentUser()
      .pipe(
        tap((response) => {
          if (response.isValid) {
            this.userData = response.data;
            this.checkPhoneUpdate();
          }
        }),
        takeUntil(this.unsubscribe),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe();
    this.subscriptions.push(subscription);
    */
  }

  /**
   * Check if phone needs to be updated
   */
  private checkPhoneUpdate(): void {
    if (!this.reservaData || !this.userData) return;

    const reservaTelefono = this.reservaData.telefono?.replace(/\D/g, '');
    const userTelefono = this.userData.telefono?.replace(/\D/g, '');

    this.phoneNeedsUpdate = reservaTelefono !== userTelefono;
  }

  /**
   * Update user phone if needed
   */
  private async updateUserPhone(): Promise<boolean> {
    if (!this.phoneNeedsUpdate || !this.userData || !this.reservaData) {
      return true;
    }

    return new Promise((resolve) => {
      // Simulación - reemplazar con llamada real
      console.log('Actualizando teléfono del usuario:', this.reservaData!.telefono);
      
      setTimeout(() => {
        this.userData!.telefono = this.reservaData!.telefono;
        this.phoneNeedsUpdate = false;
        resolve(true);
      }, 500);

      /* Implementación real:
      const subscription = this.usersService
        .updateUserPhone(this.userData.id, this.reservaData.telefono)
        .pipe(
          tap((response) => {
            if (response.isValid) {
              this.userData!.telefono = this.reservaData!.telefono;
              this.phoneNeedsUpdate = false;
              resolve(true);
            } else {
              resolve(false);
            }
          }),
          takeUntil(this.unsubscribe)
        )
        .subscribe();
      this.subscriptions.push(subscription);
      */
    });
  }

  // ===== PAYMENT METHODS =====

  /**
   * Select payment method
   */
  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
    
    // Start timer for QR methods
    if (method === 'yape' || method === 'plin') {
      this.startTimer(15 * 60); // 15 minutos
    } else {
      this.stopTimer();
    }
  }

  /**
   * Start countdown timer
   */
  private startTimer(seconds: number): void {
    this.stopTimer();
    
    let remainingSeconds = seconds;
    
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        remainingSeconds--;
        
        const minutes = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        this.paymentTimer = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        if (remainingSeconds <= 0) {
          this.stopTimer();
          this.handleTimerExpired();
        }
        
        this.cdr.markForCheck();
      });
  }

  /**
   * Stop countdown timer
   */
  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  /**
   * Handle timer expiration
   */
  private handleTimerExpired(): void {
    alert('El código QR ha expirado. Por favor, genera uno nuevo.');
    this.selectedPaymentMethod = null;
  }

  // ===== PAYMENT CONFIRMATION =====

  /**
   * Confirm payment
   */
  async onConfirmPayment(): Promise<void> {
    if (!this.selectedPaymentMethod || !this.reservaData) {
      return;
    }

    this.isProcessing = true;
    this.cdr.markForCheck();

    try {
      // 1. Actualizar teléfono si es necesario
      const phoneUpdated = await this.updateUserPhone();
      if (!phoneUpdated) {
        throw new Error('No se pudo actualizar el teléfono');
      }

      // 2. Procesar según método de pago
      switch (this.selectedPaymentMethod) {
        case 'card':
          await this.processCardPayment();
          break;
        case 'yape':
        case 'plin':
          await this.processQRPayment();
          break;
        case 'transfer':
          await this.processBankTransfer();
          break;
        case 'local':
          await this.processLocalPayment();
          break;
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      //this.openErrorAlert({ Messages: 'Error al procesar el pago. Intenta nuevamente.' });
      this.isProcessing = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Process card payment with Niubiz
   */
  private async processCardPayment(): Promise<void> {
    // Aquí integrarías con Niubiz
    console.log('Procesando pago con tarjeta (Niubiz)...');
    
    // Simulación
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redirigir a Niubiz o procesar
    // window.location.href = niubizUrl;
    
    this.navigateToConfirmation('CARD-' + Date.now());

    /* Implementación real:
    const subscription = this.paymentService
      .createNiubizSession(this.reservaData!)
      .pipe(
        tap((response) => {
          if (response.isValid) {
            // Redirigir a Niubiz
            window.location.href = response.data.sessionUrl;
          } else {
            throw new Error(response.message);
          }
        }),
        takeUntil(this.unsubscribe),
        finalize(() => {
          this.isProcessing = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe();
    this.subscriptions.push(subscription);
    */
  }

  /**
   * Process QR payment (Yape/Plin)
   */
  private async processQRPayment(): Promise<void> {
    console.log(`Procesando pago con ${this.selectedPaymentMethod}...`);
    
    // Aquí verificarías el pago con el servicio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Crear reserva pendiente de confirmación
    this.navigateToConfirmation('QR-' + Date.now(), 'pending');
  }

  /**
   * Process bank transfer
   */
  private async processBankTransfer(): Promise<void> {
    if (!this.voucherFile) {
      alert('Por favor sube el comprobante de pago');
      this.isProcessing = false;
      return;
    }

    console.log('Procesando transferencia bancaria...');
    
    // Subir comprobante y crear reserva
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.navigateToConfirmation('TRANSFER-' + Date.now(), 'pending');
  }

  /**
   * Process local payment
   */
  private async processLocalPayment(): Promise<void> {
    console.log('Procesando pago en local...');
    
    // Crear reserva con estado pendiente de pago
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    this.navigateToConfirmation('LOCAL-' + Date.now(), 'pending');
  }

  /**
   * Navigate to confirmation page
   */
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
        paymentMethod: this.selectedPaymentMethod
      }
    });
  }

  // ===== HELPER METHODS =====

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
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

  /**
   * Check if has discount
   */
  hasDiscount(): boolean {
    if (!this.reservaData) return false;
    return this.calculateSubtotal() > this.reservaData.total;
  }

  /**
   * Get discount amount
   */
  getDiscountAmount(): number {
    if (!this.reservaData) return 0;
    return this.calculateSubtotal() - this.reservaData.total;
  }

  /**
   * Copy text to clipboard
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copiado al portapapeles');
    });
  }

  /**
   * Handle voucher upload
   */
  onVoucherUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es muy grande. Máximo 5MB');
        return;
      }
      
      this.voucherFile = file;
      console.log('Archivo seleccionado:', file.name);
    }
  }

  // ===== NAVIGATION =====

  /**
   * Go back
   */
  onBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Cancel payment
   */
  onCancel(): void {
    if (confirm('¿Estás seguro de cancelar esta reserva?')) {
      // Limpiar localStorage
      if (this.reservaData?.canchaId) {
        localStorage.removeItem(`reserva_draft_${this.reservaData.canchaId}`);
      }
      this.router.navigate(['/']);
    }
  }
}
