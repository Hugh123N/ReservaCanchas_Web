import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Subject, finalize, takeUntil, tap } from "rxjs";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewContainerRef,
} from "@angular/core";
import { LoginModel } from "../../models/login.model";
import { UsersService } from "../../services/users.service";
import { AuthService } from "@core/auth/services/auth.service";
import { BaseComponent } from "@base/components/base-component/base.component";
import { MODULES } from "@core/config/permissions/modules";
import { environment } from "@environments/environment";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
})
export class LoginComponent extends BaseComponent implements OnInit, OnDestroy {
  private root = document.documentElement;
  versioncode = environment.application.code;
  versiontext = environment.application.version;
  isPasswordVisible: boolean = false;
  loading = false;
  customStylesValidated = false;
  imageBase64 = "";

  public loginMessages: any;
  public loginForm: FormGroup = new FormGroup({});
  private unsubscribe: Subject<any>;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private usersService: UsersService,
    private translate: TranslateService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super(MODULES.USERS, viewContainerRef);
    this.createForm();
    this.unsubscribe = new Subject();
  }

  ngOnInit(): void {
  }
  createForm() {
    this.loginForm = this.formBuilder.group({

      email: [
        environment.email,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(320),
        ]),
      ],
      password: [
        environment.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
      rememberMe: [true],
      recaptcha: [],
    });

    this.loginMessages = {
      email: {
        required: this.translate.instant("VALIDATION.INPUT.REQUIRED_2", {
          field: this.translate.instant("USERS.LOGIN.FORM.USERNAME"),
        }),
        minlength: this.translate.instant("VALIDATION.TEXT.MIN_LENGTH", {
          field: this.translate.instant("USERS.LOGIN.FORM.USERNAME"),
          value: 3,
        }),
        maxlength: this.translate.instant("VALIDATION.TEXT.MAX_LENGTH", {
          field: this.translate.instant("USERS.LOGIN.FORM.USERNAME"),
          value: 320,
        }),
      },
      password: {
        required: this.translate.instant("VALIDATION.INPUT.REQUIRED_3", {
          field: this.translate.instant("USERS.LOGIN.FORM.PASSWORD"),
        }),
        minlength: this.translate.instant("VALIDATION.TEXT.MIN_LENGTH", {
          field: this.translate.instant("USERS.LOGIN.FORM.PASSWORD"),
          value: 3,
        }),
        maxlength: this.translate.instant("VALIDATION.TEXT.MAX_LENGTH", {
          field: this.translate.instant("USERS.LOGIN.FORM.PASSWORD"),
          value: 100,
        }),
      },
    };
  }

  submit() {
    const controls = this.loginForm.controls;
    if (this.loginForm.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
      );
      this.customStylesValidated = true;
      return;
    }

    this.loading = true;
    this.customStylesValidated = false;

    const authData = new LoginModel();

    authData.applicationCode = environment.application.code;
    authData.userName = controls["email"].value;
    authData.password = controls["password"].value;
    authData.rememberMe = controls["rememberMe"].value;

    let subscription = this.usersService
      .login(authData)
      .pipe(
        tap((response) => {
          if (response) {
            if (response.isValid) {
              this.authService.logIn(response.data.accessToken);
              this.router.navigate(["/home"]);
            } else this.openErrorAlert(response);
          } else {
            this.openErrorAlert(response);
          }
        }),
        takeUntil(this.unsubscribe),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe();

    this.subscriptions.push(subscription);
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
