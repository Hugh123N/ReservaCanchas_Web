import { Component, OnInit, Inject, PLATFORM_ID, ViewContainerRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { BreakpointObserver, Breakpoints, LayoutModule } from "@angular/cdk/layout"
import { Observable, Subject } from "rxjs"
import { finalize, map, shareReplay, takeUntil, tap } from "rxjs/operators"

import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
//import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/auth/services/auth.service';
import { UsersService } from '../../services/users.service';
import { LoginModel } from '../../models/login.model';
import { BaseComponent } from '@base/components/base-component/base.component';


interface UserType {
  value: string;
  label: string;
  icon: string;
}

interface OAuthProvider {
  provider: 'google' | 'apple' | 'facebook';
  userType?: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}


@Component({
  selector: 'app-login',
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
    LayoutModule,
    MatChipsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent extends BaseComponent implements OnInit, OnDestroy {

  // Form
  loginForm!: FormGroup;
  private unsubscribe: Subject<any>;

  // States
  isLoading: boolean = false;
  hidePassword: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  showUserTypeSelection: boolean = false; // Cambiar a true si necesitas selector de tipo

  // User Type
  selectedUserType: string = 'cliente';
  userTypes: UserType[] = [
    { value: 'cliente', label: 'Cliente', icon: 'person' },
    { value: 'proveedor', label: 'Proveedor', icon: 'business' },
    { value: 'operador', label: 'Operador', icon: 'admin_panel_settings' }
  ];

  // Responsive
  isHandset$!: Observable<boolean>;

  // Features for side panel
  features: Feature[] = [
    /*{
      icon: 'schedule',
      title: 'Reservas 24/7',
      description: 'Reserva tu cancha en cualquier momento del día'
    },
    {
      icon: 'verified',
      title: 'Canchas Verificadas',
      description: 'Todas nuestras canchas cumplen estándares de calidad'
    },*/
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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private usersService: UsersService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
    // private oauthService: OAuthService
  ) {
    super("USERS", viewContainerRef);
    // Initialize form
    this.loginForm = this.formBuilder.group({
      applicationCode: ['Cliente', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
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
    this.route.queryParams.subscribe(params => {
      const registered = params['registered'];
      const email = params['email'];

      if (registered === 'true') {
        this.successMessage = '¡Registro exitoso! Ahora puedes iniciar sesión.';
        this.loginForm.patchValue({ email });
      }
    });
  }

  onSubmit(): void {
    const controls = this.loginForm.controls;
    if (this.loginForm.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
      );
      return;
    }

    this.clearMessages();
    this.isLoading = true;

    const loginData: LoginModel = {
      applicationCode: 'Cliente',
      userName: this.loginForm.value.email,
      password: this.loginForm.value.password,
      rememberMe: this.loginForm.value.rememberMe,
      //userType: this.selectedUserType
    };

    const subscription = this.usersService
      .login(loginData)
      .pipe(
        tap((response) => {
          if (response) {
            if (response.isValid) {
              this.authService.logIn(response.data.accessToken);
              const redirectUrl = sessionStorage.getItem('redirect_after_login');
              if (redirectUrl) {
                sessionStorage.removeItem('redirect_after_login');
                this.router.navigateByUrl(redirectUrl);
                return;
              }
              this.router.navigate(["/"]);
            } else this.openErrorAlert(response);
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




  private redirectAfterLogin(userType: string): void {
    switch (userType) {
      case 'proveedor':
        this.router.navigate(['/proveedor/dashboard']);
        break;
      case 'operador':
        this.router.navigate(['/operador/dashboard']);
        break;
      case 'cliente':
      default:
        this.router.navigate(['/']);
        break;
    }
  }

  // ===== OAUTH METHODS =====
  onGoogleLogin(): void {
    this.clearMessages();
    this.isLoading = true;

    const oauthData: OAuthProvider = {
      provider: 'google',
      userType: this.selectedUserType
    };

    // Implementación real con tu servicio OAuth
    this.performOAuthLogin(oauthData);

    /* Implementación real:
    this.oauthService.loginWithGoogle(oauthData).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.handleLoginSuccess(response.data);
        } else {
          this.handleLoginError(response.message);
        }
      },
      error: (error) => {
        this.handleLoginError('Error al iniciar sesión con Google');
      }
    });
    */
  }
  onFacebookLogin(): void {
    this.clearMessages();
    this.isLoading = true;

    const oauthData: OAuthProvider = {
      provider: 'facebook',
      userType: this.selectedUserType
    };

    this.performOAuthLogin(oauthData);

    /* Implementación real:
    this.oauthService.loginWithFacebook(oauthData).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.handleLoginSuccess(response.data);
        } else {
          this.handleLoginError(response.message);
        }
      },
      error: (error) => {
        this.handleLoginError('Error al iniciar sesión con Facebook');
      }
    });
    */
  }

  /**
   * Simulated OAuth login (replace with real service)
   */
  private performOAuthLogin(oauthData: OAuthProvider): void {
    console.log('OAuth login:', oauthData);

    // Simulación - Reemplazar con llamada real
    setTimeout(() => {
      this.isLoading = false;
      this.errorMessage = `Login con ${oauthData.provider} en desarrollo. Por favor usa email/contraseña.`;

      setTimeout(() => {
        this.clearMessages();
      }, 3000);
    }, 1000);
  }


  /**
   * Change user type
   */
  onUserTypeChange(userType: string): void {
    this.selectedUserType = userType;
    this.clearMessages();
  }

  onForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  onRegister(): void {
    this.router.navigate(['/auth/register'], {
      queryParams: { userType: this.selectedUserType }
    });
  }

  close(): void {
    this.router.navigate(['/']);
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
