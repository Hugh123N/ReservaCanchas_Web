import { Component, OnInit, Inject, ViewContainerRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { finalize, map, shareReplay, takeUntil, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services
import { UsersService } from '../../services/users.service';
import { BaseComponent } from '@base/components/base-component/base.component';
import { AuthVisualPanelComponent } from '../../components/auth-visual-panel/auth-visual-panel.component';
import { AuthMessageComponent } from '../../components/auth-message/auth-message.component';
import { AUTH_FEATURES_FORGOT_PASSWORD } from '../../constants/auth-features.constants';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    LayoutModule,
    AuthVisualPanelComponent,
    AuthMessageComponent
  ],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent extends BaseComponent implements OnInit, OnDestroy {

  // Form
  forgotPasswordForm!: FormGroup;
  private unsubscribe: Subject<any>;

  // States
  errorMessage: string = '';
  successMessage: string = '';
  emailSent: boolean = false;

  // Responsive
  isHandset$!: Observable<boolean>;

  // Use constant from shared file instead of duplicating
  readonly features = AUTH_FEATURES_FORGOT_PASSWORD;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    private usersService: UsersService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('USERS', viewContainerRef);

    // Initialize form
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Initialize responsive observer
    this.isHandset$ = this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );

    this.unsubscribe = new Subject<any>();
  }

  ngOnInit(): void {
    // Component initialization
  }

  override ngOnDestroy(): void {
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }

  onSubmit(): void {
    const controls = this.forgotPasswordForm.controls;

    if (this.forgotPasswordForm.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
      );
      return;
    }

    this.clearMessages();

    const email = this.forgotPasswordForm.value.email;
    const host = window.location.hostname; // URL del frontend para el enlace de reset

    const subscription = this.usersService
      .forgotPassword(email, host)
      .pipe(
        tap((response) => {
          if (response.isValid) {
            this.emailSent = true;
            this.successMessage = 'Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada.';
            this.forgotPasswordForm.reset();
          } else {
            this.openErrorAlert(response);
          }
        }),
        takeUntil(this.unsubscribe)
      )
      .subscribe({
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Error al enviar el correo de recuperación. Por favor, intenta nuevamente.';
        }
      });

    this.subscriptions.push(subscription);
  }

  onBackToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  close(): void {
    this.router.navigate(['/']);
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
