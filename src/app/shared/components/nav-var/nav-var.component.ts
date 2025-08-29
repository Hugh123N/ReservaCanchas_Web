import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-nav-var',
  imports: [MatIconModule, MatMenuModule, MatToolbarModule, FlexLayoutModule, MatButtonModule],
  templateUrl: './nav-var.component.html',
  styleUrl: './nav-var.component.css'
})
export class NavVarComponent {

  constructor() { }

  onIniciarSesion() {
    console.log("Iniciar sesión")
    // Aquí iría la navegación al login
  }

  onRegistrarse() {
    console.log("Registrarse")
    // Aquí iría la navegación al registro
  }
}
