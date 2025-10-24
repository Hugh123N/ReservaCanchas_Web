import { Component, OnInit, Inject, ViewContainerRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { finalize, map, shareReplay, takeUntil, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services & Models
import { UsersService } from '../../services/users.service';
import { BaseComponent } from '@base/components/base-component/base.component';
import { ResetPasswordModel } from '../../models/reset-password.model';
import { passwordMatchValidator } from '@shared/validators/password-match-validator';
import { FeatureAuth } from '../../types/featureAuth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    LayoutModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent extends BaseComponent implements OnInit, OnDestroy {

  resetPasswordForm!: FormGroup;
  private unsubscribe: Subject<any>;

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  passwordReset: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Query params
  email: string = '';
  code: string = '';

  // Responsive
  isHandset$!: Observable<boolean>;

  features: FeatureAuth[] = [
    {
      icon: 'verified_user',
      title: 'Proceso Verificado',
      description: 'Tu identidad ha sido confirmada mediante el código de seguridad'
    },
    {
      icon: 'lock_clock',
      title: 'Acceso Inmediato',
      description: 'Una vez cambiada tu contraseña, podrás iniciar sesión de inmediato'
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    private usersService: UsersService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('USERS', viewContainerRef);

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
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.code = params['code'] || '';

      if (!this.email || !this.code) {
        this.errorMessage = 'El enlace de recuperación no es válido o ha expirado.';
      }
    });

    // Initialize form
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, passwordMatchValidator()]]
    });
  }

  override ngOnDestroy(): void {
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }

  onSubmit(): void {
    const controls = this.resetPasswordForm.controls;

    if (this.resetPasswordForm.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
      );
      return;
    }

    if (!this.email || !this.code) {
      this.errorMessage = 'El enlace de recuperación no es válido.';
      return;
    }

    this.clearMessages();
    this.isLoading = true;

    const model = new ResetPasswordModel();
    model.email = this.email;
    model.code = parseInt(this.code);
    model.password = this.resetPasswordForm.value.password;
    model.confirmPassword = this.resetPasswordForm.value.confirmPassword;

    const subscription = this.usersService
      .resetPassword(model)
      .pipe(
        tap((response) => {
          if (response.isValid) {
            this.passwordReset = true;
            this.successMessage = '¡Contraseña cambiada exitosamente! Ahora puedes iniciar sesión con tu nueva contraseña.';
            this.resetPasswordForm.reset();
            // Redirect to login after 3 seconds
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 3000);
          } else {
            this.openErrorAlert(response);
          }
        }),
        takeUntil(this.unsubscribe),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Error al restablecer la contraseña. Por favor, solicita un nuevo enlace de recuperación.';
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

}
