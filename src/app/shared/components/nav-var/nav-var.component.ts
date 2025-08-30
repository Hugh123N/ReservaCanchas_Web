import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-var',
  imports: [MatIconModule, MatMenuModule, MatToolbarModule, FlexLayoutModule, MatButtonModule],
  templateUrl: './nav-var.component.html',
  styleUrl: './nav-var.component.css'
})
export class NavVarComponent {

  constructor(private router: Router) { }

  onIniciarSesion() {
    console.log("Iniciar sesión")
    this.router.navigate(['/auth/login']);
  }

  onRegistrarse() {
    console.log("Registrarse")
    this.router.navigate(['/auth/register']);
  }
}
