import { Component, HostListener, Inject, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkMenuModule, CdkMenuTrigger } from '@angular/cdk/menu';
import { Dialog, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { ConnectedPosition, Overlay } from '@angular/cdk/overlay';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, finalize } from 'rxjs';
import { AuthService } from '@core/auth/services/auth.service';
import { User } from 'app/features/auth/models/user';
import { BaseComponent } from '@base/components/base-component/base.component';

@Component({
  selector: 'app-nav-var',
  standalone: true,
  imports: [CommonModule, RouterModule, CdkMenuModule, DialogModule],
  templateUrl: './nav-var.component.html',
  styleUrl: './nav-var.component.css'
})
export class NavVarComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() showOwnerNotice = false;
  @ViewChild('mobileMenu', { static: true }) private mobileMenu!: TemplateRef<unknown>;
  @ViewChild(CdkMenuTrigger) private userMenuTrigger?: CdkMenuTrigger;

  isAuthenticated = false;
  currentUser: User | null = null;
  isMenuOpen = false;
  isUserMenuOpen = false;
  isLoggingOut = false;
  ownerNoticeDismissed = false;

  readonly userMenuPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 10 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -10 }
  ];
  private drawerRef?: DialogRef<unknown>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialog: Dialog,
    private overlay: Overlay,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('NAV-BAR', viewContainerRef);
  }

  get userName(): string {
    return this.currentUser?.fullname?.trim() || this.currentUser?.username?.trim() || 'Usuario';
  }

  get userInitials(): string {
    const parts = this.userName.split(/\s+/);
    return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : this.userName.slice(0, 2)).toUpperCase();
  }

  ngOnInit(): void {
    this.checkAuthentication();
    this.subscriptions.push(
      this.authService.user$.subscribe(user => {
        this.currentUser = user;
        this.isAuthenticated = this.authService.isAuthenticated();
      }),
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
        this.closeMenu();
        this.checkAuthentication();
      })
    );
  }

  override ngOnDestroy(): void {
    this.closeMenu();
    super.ngOnDestroy();
  }

  private checkAuthentication(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.isAuthenticated ? this.authService.loadUserProfile() : null;
  }

  toggleMenu(): void {
    if (this.isMenuOpen) {
      this.closeMenu();
      return;
    }
    this.userMenuTrigger?.close();
    this.isMenuOpen = true;
    // CDK mantiene el foco dentro del panel y restaura el scroll al cerrarlo.
    const ref = this.dialog.open(this.mobileMenu, {
      width: 'min(340px, 88vw)',
      maxWidth: '100vw',
      height: '100dvh',
      positionStrategy: this.overlay.position().global().top('0').right('0'),
      ariaLabel: 'Menú de navegación',
      autoFocus: '.drawer-close',
      restoreFocus: true,
      backdropClass: 'rf-navbar-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      viewContainerRef: this.viewContainerRef
    });
    this.drawerRef = ref;
    this.subscriptions.push(ref.closed.subscribe(() => {
      if (this.drawerRef === ref) {
        this.isMenuOpen = false;
        this.drawerRef = undefined;
      }
    }));
  }

  closeMenu(): void {
    this.userMenuTrigger?.close();
    this.drawerRef?.close();
    this.isMenuOpen = false;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (typeof window === 'undefined') return;
    if (window.innerWidth > 980) {
      this.drawerRef?.close();
    } else {
      this.userMenuTrigger?.close();
    }
  }

  onComoFunciona(event?: MouseEvent): void {
    if (event && (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0)) return;
    event?.preventDefault();
    this.closeMenu();
    if (typeof window === 'undefined') return;

    if (this.router.url.split(/[?#]/)[0] === '/') {
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
    const headerHeight = document.querySelector('.rf-navbar')?.getBoundingClientRect().height ?? 72;
    const offset = element.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    window.scrollTo({ top: offset, behavior });
  }

  onIniciarSesion(): void {
    this.closeMenu();
    this.router.navigate(['/auth/login']);
  }

  onRegistrarse(): void {
    this.closeMenu();
    this.router.navigate(['/auth/register']);
  }

  onCerrarSesion(): void {
    if (this.isLoggingOut) return;
    this.closeMenu();
    this.isLoggingOut = true;
    this.subscriptions.push(this.authService.logOut().pipe(
      finalize(() => { this.isLoggingOut = false; })
    ).subscribe({
      next: response => {
        if (response.isValid) {
          this.isAuthenticated = false;
          this.currentUser = null;
        } else {
          this.openAlert(response);
        }
      },
      error: err => {
        console.error('Error al cerrar sesión:', err);
        this.openAlert(err);
      }
    }));
  }
}
