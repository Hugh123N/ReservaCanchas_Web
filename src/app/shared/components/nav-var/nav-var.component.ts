import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { User } from 'app/features/auth/models/user';

@Component({
  selector: 'app-nav-var',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './nav-var.component.html',
  styleUrl: './nav-var.component.css'
})
export class NavVarComponent implements OnInit {

  isAuthenticated: boolean = false;
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkAuthentication();
  }

  private checkAuthentication(): void {
    // Proteger contra SSR (localStorage no disponible en server)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.isAuthenticated = this.authService.isAuthenticated();
      if (this.isAuthenticated) {
        this.currentUser = this.authService.loadUserProfile();
      }
    }
  }

  onIniciarSesion(): void {
    console.log("Iniciar sesión")
    this.router.navigate(['/auth/login']);
  }

  onRegistrarse(): void {
    console.log("Registrarse")
    this.router.navigate(['/auth/register']);
  }

  onPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  onMisReservas(): void {
    this.router.navigate(['/mis-reservas']);
  }

  onCerrarSesion(): void {
    this.authService.logOut().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.isAuthenticated = false;
          this.currentUser = null;
        }
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
        this.isAuthenticated = false;
        this.currentUser = null;
      }
    });
  }
}
