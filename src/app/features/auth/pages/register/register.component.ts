import { ChangeDetectorRef, Component, Inject, OnDestroy, ViewContainerRef, type OnInit } from '@angular/core';
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { passwordMatchValidator } from '@shared/validators/password-match-validator';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseComponent } from '@base/components/base-component/base.component';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { LayoutModule } from '@angular/cdk/layout';
import { ResponsiveService } from '@core/services/responsive.service';
import { UsersService } from '../../services/users.service';
import { CreateUserModel } from '../../models/create-user.model';
import { OAuthHandlerService } from '../../services/oauth-handler.service';
import { OAuthProvider } from '../../services/oauth';
import { AuthVisualPanelComponent } from '../../components/auth-visual-panel/auth-visual-panel.component';
import { AuthSocialButtonsComponent } from '../../components/auth-social-buttons/auth-social-buttons.component';
import { AuthMessageComponent } from '../../components/auth-message/auth-message.component';
import { AUTH_FEATURES_LOGIN_REGISTER } from '../../constants/auth-features.constants';



@Component({
  selector: 'app-register',
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
    MatChipsModule,
    LayoutModule,
    AuthVisualPanelComponent,
    AuthSocialButtonsComponent,
    AuthMessageComponent,
    RouterLink
  ],
  templateUrl: './register.component.html'
})
export class RegisterComponent extends BaseComponent implements OnInit, OnDestroy {

  registerForm!: FormGroup;
  private unsubscribe: Subject<any>;

  // States
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
    private responsiveService: ResponsiveService,
    private usersService: UsersService,
    private oauthHandler: OAuthHandlerService,
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
      validators: passwordMatchValidator()
    });

    // Use shared responsive service
    this.isHandset$ = this.responsiveService.isHandset$;

    this.unsubscribe = new Subject<any>();
  }

  readonly features = AUTH_FEATURES_LOGIN_REGISTER;

  ngOnInit(): void {
  }

  override ngOnDestroy(): void {
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }

  onSubmit(): void {
    if (!this.validateForm(this.registerForm)) {
      return;
    }

    this.clearMessages();
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
        takeUntil(this.unsubscribe)
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

  /**
   * Maneja la autenticación OAuth para cualquier proveedor.
   * @param provider - Proveedor OAuth (Google, Facebook, etc.)
   */
  onOAuthRegister(provider: OAuthProvider): void {
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
  onGoogleRegister(): void {
    this.onOAuthRegister(OAuthProvider.GOOGLE);
  }

  onFacebookRegister(): void {
    this.onOAuthRegister(OAuthProvider.FACEBOOK);
  }

  close(): void {
    this.router.navigate(['/']);
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
