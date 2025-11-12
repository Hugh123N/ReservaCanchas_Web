import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseComponent } from '@base/components/base-component/base.component';
import { AuthService } from '@core/auth/services/auth.service';
import { UsersService } from 'app/features/auth/services/users.service';
import { GetUserModel } from 'app/features/auth/models/get-user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent extends BaseComponent implements OnInit {

  usuario: GetUserModel | null = null;
  isLoading: boolean = false;
  defaultAvatar: string = 'assets/images/default-avatar.png';

  private unsubscribe = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private usersService: UsersService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('USER_PROFILE', viewContainerRef);
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * Cargar perfil del usuario autenticado
   */
  loadUserProfile(): void {
    const currentUser = this.authService.loadUserProfile();
    if (!currentUser || !currentUser.id) {
      this.openErrorAlert('No se pudo obtener el usuario autenticado');
      return;
    }

    this.isLoading = true;

    const subscription = this.usersService
      .getUser(currentUser.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (response) => {
          if (response.isValid && response.data) {
            this.usuario = response.data;
          } else {
            this.openErrorAlert(response || 'Error al cargar el perfil');
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.openErrorAlert(error || 'Error al cargar el perfil');
          this.isLoading = false;
        }
      });

    this.subscriptions.push(subscription);
  }

  /**
   * Obtener URL del avatar (imagen o default)
   */
  getAvatarUrl(): string {
    return this.usuario?.imagen || this.defaultAvatar;
  }

  /**
   * Verificar si tiene imagen personalizada
   */
  hasCustomAvatar(): boolean {
    return !!(this.usuario?.imagen && this.usuario.imagen.trim() !== '');
  }

  /**
   * Obtener nombre completo
   */
  getFullName(): string {
    if (!this.usuario) return '';
    return `${this.usuario.firstName} ${this.usuario.lastName}`.trim();
  }

  /**
   * Navegar hacia atrás
   */
  onBack(): void {
    this.router.navigate(['/']);
  }

  override ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    super.ngOnDestroy();
  }
}
