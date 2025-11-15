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
import { UserType } from '../../types/userTypes';
import { OAuthProvider } from '../../types/oAuthProvider';
import { FeatureAuth } from '../../types/featureAuth';
import { OAuthService } from '../../services/oauth.service';


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
  templateUrl: './login.component.html'
})
export class LoginComponent extends BaseComponent implements OnInit, OnDestroy {

  loginForm!: FormGroup;
  private unsubscribe: Subject<any>;

  isLoading: boolean = false;
  hidePassword: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';

  isHandset$!: Observable<boolean>;

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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private usersService: UsersService,
    private oauthService: OAuthService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super("USERS", viewContainerRef);
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

  onGoogleLogin(): void {
    this.clearMessages();
    this.isLoading = true;

    const subscription = this.oauthService
      .loginWithGoogle()
      .subscribe({
        next: (idToken: string) => {
          // Token de Google recibido, enviarlo al backend
          this.usersService
            .loginWithOAuth('Google', idToken)
            .pipe(
              tap((response) => {
                if (response && response.isValid) {
                  this.authService.logIn(response.data.accessToken);
                  this.successMessage = '¡Login exitoso con Google!';

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
                  this.errorMessage = response?.Messages?.join(', ') || 'Error al autenticar con Google';
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
          this.errorMessage = 'Error al iniciar sesión con Google. Por favor intenta nuevamente.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });

    this.subscriptions.push(subscription);
  }
  onFacebookLogin(): void {
    this.clearMessages();
    this.isLoading = true;

    const subscription = this.oauthService
      .loginWithFacebook()
      .subscribe({
        next: (accessToken: string) => {
          // Access token de Facebook recibido, enviarlo al backend
          this.usersService
            .loginWithOAuth('Facebook', accessToken)
            .pipe(
              tap((response) => {
                if (response && response.isValid) {
                  this.authService.logIn(response.data.accessToken);
                  this.successMessage = '¡Login exitoso con Facebook!';

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
                  this.errorMessage = response?.Messages?.join(', ') || 'Error al autenticar con Facebook';
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
          this.errorMessage = 'Error al iniciar sesión con Facebook. Por favor intenta nuevamente.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });

    this.subscriptions.push(subscription);
  }

  onForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  onRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  close(): void {
    this.router.navigate(['/']);
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
