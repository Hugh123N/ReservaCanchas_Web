import { Component, HostListener, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '@core/auth/services/auth.service';
import { User } from 'app/features/auth/models/user';
import { BaseComponent } from '@base/components/base-component/base.component';
import { SessionWarningComponent } from '../session-warning/session-warning.component';

@Component({
  selector: 'app-nav-var',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatButtonModule,
    SessionWarningComponent
  ],
  templateUrl: './nav-var.component.html',
  styleUrl: './nav-var.component.css'
})
export class NavVarComponent extends BaseComponent implements OnInit {

  isAuthenticated: boolean = false;
  currentUser: User | null = null;
  isMenuOpen: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('NAV-BAR', viewContainerRef);
  }

  ngOnInit(): void {
    this.checkAuthentication();

    this.subscriptions.push(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => this.closeMenu())
    );
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

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMenuOpen || typeof document === 'undefined') return;
    const target = event.target as HTMLElement | null;
    if (target && !target.closest('.header-wrap')) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeMenu();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      this.closeMenu();
    }
  }

  onComoFunciona(event?: Event): void {
    event?.preventDefault();
    this.closeMenu();

    if (typeof window === 'undefined') return;

    // Si ya estamos en home, scroll directo; si no, navegar y esperar el render
    if (this.router.url.split('#')[0] === '/') {
      this.scrollToComo();
      return;
    }

    this.router.navigate(['/'], { fragment: 'como' }).then(() => {
      setTimeout(() => this.scrollToComo());
    });
  }

  private scrollToComo(): void {
    const element = document.getElementById('como');
    if (!element) return;
    const offset = element.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }

  onIniciarSesion(): void {
    this.closeMenu();
    this.router.navigate(['/auth/login']);
  }

  onRegistrarse(): void {
    this.closeMenu();
    this.router.navigate(['/auth/register']);
  }

  onPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  onMisReservas(): void {
    this.router.navigate(['/mis-reservas']);
  }

  onCerrarSesion(): void {
    this.closeMenu();
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
