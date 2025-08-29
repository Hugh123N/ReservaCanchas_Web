import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout"
import type { Observable } from "rxjs"
import { map, shareReplay } from "rxjs/operators"

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

import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatChipsModule, MatDividerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup
  selectedUserType = "cliente"
  selectedTabIndex = 0
  hidePassword = true

  isHandset$!: Observable<boolean>;

  constructor(
    private formBuilder: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      console.log(window.innerWidth);
    }
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });

    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map((result) => result.matches),
      shareReplay(),
    );
  }

  ngOnInit(): void {}

    /*onTabChange(event: MatTabChangeEvent): void {
    this.selectedTabIndex = event.index;

    switch (event.index) {
      case 0:
        this.selectedUserType = "cliente";
        break;
      case 1:
        this.selectedUserType = "proveedor";
        break;
      case 2:
        this.selectedUserType = "operador";
        break;
    }
  }*/

  onUserTypeChange(userType: string): void {
    this.selectedUserType = userType
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const formData = {
        ...this.loginForm.value,
        userType: this.selectedUserType,
      }
      console.log("Login data:", formData)
      // Aquí implementarías la lógica de autenticación
    } else {
      this.markFormGroupTouched()
    }
  }

  onGoogleLogin(): void {
    console.log("Google login for:", this.selectedUserType)
    // Aquí implementarías la autenticación con Google
  }

  onForgotPassword(): void {
    console.log("Forgot password")
    // Navegar a página de recuperación de contraseña
  }

  onRegister(): void {
    console.log("Register as:", this.selectedUserType)
    // Navegar a página de registro
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key)
      control?.markAsTouched()
    })
  }

  getEmailErrorMessage(): string {
    const emailControl = this.loginForm.get("email")
    if (emailControl?.hasError("required")) {
      return "El email es requerido"
    }
    if (emailControl?.hasError("email")) {
      return "Ingresa un email válido"
    }
    return ""
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.loginForm.get("password")
    if (passwordControl?.hasError("required")) {
      return "La contraseña es requerida"
    }
    if (passwordControl?.hasError("minlength")) {
      return "La contraseña debe tener al menos 6 caracteres"
    }
    return ""
  }

  close() {
    this.router.navigate(['/']); // redirige al home principal
  }
}
