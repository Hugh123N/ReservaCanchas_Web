import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-var',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatToolbarModule, MatButtonModule],
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
