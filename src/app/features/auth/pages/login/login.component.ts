import { Component, OnInit, Inject, ViewContainerRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { LayoutModule } from "@angular/cdk/layout"
import { Observable, Subject } from "rxjs"
import { takeUntil, tap } from "rxjs/operators"
import { ResponsiveService } from '@core/services/responsive.service';

import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/auth/services/auth.service';
import { UsersService } from '../../services/users.service';
import { LoginModel } from '../../models/login.model';
import { BaseComponent } from '@base/components/base-component/base.component';
import { OAuthHandlerService } from '../../services/oauth-handler.service';
import { OAuthProvider } from '../../services/oauth';
import { AuthVisualPanelComponent } from '../../components/auth-visual-panel/auth-visual-panel.component';
import { AuthSocialButtonsComponent } from '../../components/auth-social-buttons/auth-social-buttons.component';
import { AuthMessageComponent } from '../../components/auth-message/auth-message.component';
import { AUTH_FEATURES_LOGIN_REGISTER } from '../../constants/auth-features.constants';


@Component({
  selector: 'app-login',
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
    MatCheckboxModule,
    MatProgressSpinnerModule,
    LayoutModule,
    MatChipsModule,
    AuthVisualPanelComponent,
    AuthSocialButtonsComponent,
    AuthMessageComponent,
    RouterLink
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent extends BaseComponent implements OnInit, OnDestroy {

  loginForm!: FormGroup;
  private unsubscribe: Subject<any>;

  hidePassword: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';

  isHandset$!: Observable<boolean>;

  // Use constant from shared file instead of duplicating
  readonly features = AUTH_FEATURES_LOGIN_REGISTER;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private responsiveService: ResponsiveService,
    private authService: AuthService,
    private usersService: UsersService,
    private oauthHandler: OAuthHandlerService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super("USERS", viewContainerRef);
    this.loginForm = this.formBuilder.group({
      applicationCode: ['Cliente', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Use shared responsive service
    this.isHandset$ = this.responsiveService.isHandset$;

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
    if (!this.validateForm(this.loginForm)) {
      return;
    }

    this.clearMessages();

    const loginData: LoginModel = {
      applicationCode: 'Cliente',
      userName: this.loginForm.value.email,
      password: this.loginForm.value.password,
      rememberMe: this.loginForm.value.rememberMe,
    };

    const subscription = this.usersService
      .login(loginData)
      .pipe(
        tap(async (response) => {
          if (response) {
            if (response.isValid) {
              // CASUÍSTICA 2: Login ahora es async y carga favoritos automáticamente
              await this.authService.logIn(response.data.accessToken);
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
        takeUntil(this.unsubscribe)
      )
      .subscribe();

    this.subscriptions.push(subscription);

  }

  /**
   * Maneja la autenticación OAuth para cualquier proveedor.
   * @param provider - Proveedor OAuth (Google, Facebook, etc.)
   */
  onOAuthLogin(provider: OAuthProvider): void {
    this.clearMessages();

    this.oauthHandler.authenticate(provider, {
      onSuccess: (message) => {
        this.successMessage = message;
        this.cdr.markForCheck();
      },
      onError: (message) => {
        this.errorMessage = message;
        this.cdr.markForCheck();
      },
      onFinally: () => {
        this.cdr.markForCheck();
      }
    });
  }

  // Helpers para template (mantienen compatibilidad)
  onGoogleLogin(): void {
    this.onOAuthLogin(OAuthProvider.GOOGLE);
  }

  onFacebookLogin(): void {
    this.onOAuthLogin(OAuthProvider.FACEBOOK);
  }

  close(): void {
    this.router.navigate(['/']);
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
