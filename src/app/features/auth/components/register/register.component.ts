import { Component, type OnInit } from '@angular/core';
import {FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"

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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatChipsModule, MatDividerModule, MatFormFieldModule, MatInputModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup
  selectedUserType = "cliente"
  hidePassword = true

  constructor(private form: FormBuilder, private router: Router) {
    this.registerForm = this.form.group({
      nombre: ["", [Validators.required, Validators.minLength(2)]],
      email: ["", [Validators.required, Validators.email]],
      telefono: ["", [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  ngOnInit(): void { }

  onUserTypeChange(userType: string): void {
    this.selectedUserType = userType
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formData = {
        ...this.registerForm.value,
        userType: this.selectedUserType,
      }
      console.log("Registro:", formData)
      // Aquí implementarías la lógica de registro
    } else {
      this.markFormGroupTouched()
    }
  }

  onGoogleRegister(): void {
    console.log("Registro con Google como:", this.selectedUserType)
    // Implementar registro con Google
  }

  onLoginRedirect(): void {
    console.log("Redirigir a login")
    this.router.navigate(['/auth/login'])
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key)
      control?.markAsTouched()
    })
  }

  getErrorMessage(fieldName: string): string {
    const control = this.registerForm.get(fieldName)
    if (control?.hasError("required")) {
      return `${this.getFieldDisplayName(fieldName)} es requerido`
    }
    if (control?.hasError("email")) {
      return "Email no válido"
    }
    if (control?.hasError("minlength")) {
      const minLength = control.errors?.["minlength"].requiredLength
      return `Mínimo ${minLength} caracteres`
    }
    if (control?.hasError("pattern") && fieldName === "telefono") {
      return "Teléfono debe tener 9 dígitos"
    }
    return ""
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      nombre: "Nombre",
      email: "Email",
      telefono: "Teléfono",
      password: "Contraseña",
    }
    return displayNames[fieldName] || fieldName
  }
}
