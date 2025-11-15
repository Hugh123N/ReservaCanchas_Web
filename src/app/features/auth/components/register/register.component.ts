import { ChangeDetectorRef, Component, Inject, OnDestroy, ViewContainerRef, type OnInit } from '@angular/core';
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from "@angular/forms"

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseComponent } from '@base/components/base-component/base.component';
import { finalize, map, Observable, shareReplay, Subject, takeUntil, tap } from 'rxjs';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { UsersService } from '../../services/users.service';
import { CreateUserModel } from '../../models/create-user.model';
import { Features } from 'tailwindcss';
import { OAuthProvider } from '../../types/oAuthProvider';
import { FeatureAuth } from '../../types/featureAuth';
import { OAuthService } from '../../services/oauth.service';
import { AuthService } from '@core/auth/services/auth.service';



@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    LayoutModule
  ],
  templateUrl: './register.component.html'
})
export class RegisterComponent extends BaseComponent implements OnInit, OnDestroy {

  registerForm!: FormGroup;
  private unsubscribe: Subject<any>;

  // States
  isLoading: boolean = false;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';

  // Responsive
  isHandset$!: Observable<boolean>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    private usersService: UsersService,
    private oauthService: OAuthService,
    private authService: AuthService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super("USERS", viewContainerRef);

    // Initialize form with validators
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)]
      ],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
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

  features: FeatureAuth[] = [
    {
      icon: 'payment',
      title: 'Pago Seguro',
      description: 'Múltiples métodos de pago seguros y confiables'
    },
    {
      icon: 'support_agent',
      title: 'Soporte 24/7',
      description: 'Nuestro equipo está disponible para ayudarte'
    }
  ];

  ngOnInit(): void {
    // Initialize component
  }

  override ngOnDestroy(): void {
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    const controls = this.registerForm.controls;

    if (this.registerForm.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
      );
      return;
    }

    this.clearMessages();
    this.isLoading = true;
    const registerData: CreateUserModel = {
      username: this.registerForm.value.email.trim().toLowerCase(),
      firstName: this.registerForm.value.firstName.trim(),
      lastName: this.registerForm.value.lastName.trim(),
      email: this.registerForm.value.email.trim().toLowerCase(),
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
      phoneNumber: ''
    };

    const subscription = this.usersService
      .createUser(registerData)
      .pipe(
        tap((response) => {
          if (response) {
            if (response.isValid) {
              this.handleRegisterSuccess(response.data);
            } else {
              this.openErrorAlert(response);
            }
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
      .subscribe();

    this.subscriptions.push(subscription);
  }

  private handleRegisterSuccess(data: any): void {
    this.successMessage = '¡Cuenta creada exitosamente! Redirigiendo al login...';

    // Redirect to login after 2 seconds
    setTimeout(() => {
      this.router.navigate(['/auth/login'], {
        queryParams: { registered: 'true', email: this.registerForm.value.email }
      });
    }, 2000);
  }

  onGoogleRegister(): void {
    this.clearMessages();
    this.isLoading = true;

    const subscription = this.oauthService
      .loginWithGoogle()
      .subscribe({
        next: (idToken: string) => {
          // Token de Google recibido, enviarlo al backend (el backend crea o busca el usuario)
          this.usersService
            .loginWithOAuth('Google', idToken)
            .pipe(
              tap((response) => {
                if (response && response.isValid) {
                  this.authService.logIn(response.data.accessToken);
                  this.successMessage = '¡Registro exitoso con Google! Redirigiendo...';

                  setTimeout(() => {
                    const redirectUrl = sessionStorage.getItem('redirect_after_login');
                    if (redirectUrl) {
                      sessionStorage.removeItem('redirect_after_login');
                      this.router.navigateByUrl(redirectUrl);
                    } else {
                      this.router.navigate(['/']);
                    }
                  }, 1000);
                } else {
                  this.errorMessage = response?.Messages?.join(', ') || 'Error al registrarse con Google';
                }
              }),
              takeUntil(this.unsubscribe),
              finalize(() => {
                this.isLoading = false;
                this.cdr.markForCheck();
              })
            )
            .subscribe();
        },
        error: (error) => {
          this.errorMessage = 'Error al registrarse con Google. Por favor intenta nuevamente.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });

    this.subscriptions.push(subscription);
  }

  onFacebookRegister(): void {
    this.clearMessages();
    this.isLoading = true;

    const subscription = this.oauthService
      .loginWithFacebook()
      .subscribe({
        next: (accessToken: string) => {
          // Access token de Facebook recibido, enviarlo al backend (el backend crea o busca el usuario)
          this.usersService
            .loginWithOAuth('Facebook', accessToken)
            .pipe(
              tap((response) => {
                if (response && response.isValid) {
                  this.authService.logIn(response.data.accessToken);
                  this.successMessage = '¡Registro exitoso con Facebook! Redirigiendo...';

                  setTimeout(() => {
                    const redirectUrl = sessionStorage.getItem('redirect_after_login');
                    if (redirectUrl) {
                      sessionStorage.removeItem('redirect_after_login');
                      this.router.navigateByUrl(redirectUrl);
                    } else {
                      this.router.navigate(['/']);
                    }
                  }, 1000);
                } else {
                  this.errorMessage = response?.Messages?.join(', ') || 'Error al registrarse con Facebook';
                }
              }),
              takeUntil(this.unsubscribe),
              finalize(() => {
                this.isLoading = false;
                this.cdr.markForCheck();
              })
            )
            .subscribe();
        },
        error: (error) => {
          this.errorMessage = 'Error al registrarse con Facebook. Por favor intenta nuevamente.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });

    this.subscriptions.push(subscription);
  }

  onLogin(): void {
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
