import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseComponent } from '@base/components/base-component/base.component';
import { AuthService } from '@core/auth/services/auth.service';
import { UsersService } from 'app/features/auth/services/users.service';
import { GetUserModel } from 'app/features/auth/models/get-user.model';
import { UpdateUserModel } from 'app/features/auth/models/update-user.model';
import { Subject, takeUntil } from 'rxjs';
import { TypedFormGroup } from '@shared/types/types-form';
import { UserProfileFormModel } from '../../models/user-profile-form.model';
import { UserProfileFormMapper } from '../../mappers/user-profile-form.mapper';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent extends BaseComponent implements OnInit {

  usuario: GetUserModel | null = null;
  form!: TypedFormGroup<UserProfileFormModel>;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  readonly defaultAvatar = 'assets/images/default-avatar.png';

  private unsubscribe = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private usersService: UsersService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('USER_PROFILE', viewContainerRef);
  }

  ngOnInit(): void {
    this.form = UserProfileFormMapper.initForm(this.fb);
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.loadUserProfile();
    if (!currentUser?.id) {
      this.openErrorAlert('No se pudo obtener el usuario autenticado');
      return;
    }

    const sub = this.usersService.getUser(currentUser.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (response) => {
          if (response.isValid && response.data) {
            this.usuario = response.data;
            UserProfileFormMapper.fillForm(this.form, this.usuario);
            this.imagePreview = this.usuario?.imagen || null;
          } else {
            this.openErrorAlert(response || 'Error al cargar el perfil');
          }
        },
        error: (err) => this.openErrorAlert(err || 'Error al cargar el perfil')
      });

    this.subscriptions.push(sub);
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm(this.form)) return;

    const confirmed = await this.confirmAction(
      '¿Guardar cambios?',
      'Se actualizará tu información de perfil'
    );
    if (!confirmed) return;

    const updateDto = new UpdateUserModel();
    updateDto.id = this.usuario!.id;
    updateDto.firstName = this.form.controls.firstName.value;
    updateDto.lastName = this.form.controls.lastName.value;
    updateDto.userName = this.form.controls.userName.value;
    updateDto.email = this.form.controls.email.value;
    updateDto.phoneNumber = this.form.controls.phoneNumber.value || '';
    updateDto.imagen = this.imagePreview || '';
    updateDto.roleIds = this.usuario!.roleIds || [];

    const sub = this.usersService.updateUser(updateDto)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (response) => {
          if (response.isValid) {
            this.usuario = { ...this.usuario!, ...updateDto } as GetUserModel;
            this.openSuccessAlert('Perfil actualizado exitosamente');
          } else {
            this.openErrorAlert(response || 'Error al actualizar el perfil');
          }
        },
        error: (err) => this.openErrorAlert(err || 'Error al actualizar el perfil')
      });

    this.subscriptions.push(sub);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.openWarningAlert('Por favor selecciona un archivo de imagen válido');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.openWarningAlert('La imagen no debe superar 5MB');
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => this.imagePreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = this.usuario?.imagen || null;
    const input = document.getElementById('imageInput') as HTMLInputElement;
    if (input) input.value = '';
  }

  getFullName(): string {
    if (!this.usuario) return '';
    return `${this.usuario.firstName} ${this.usuario.lastName}`.trim();
  }

  getIniciales(): string {
    const nombre = this.usuario?.firstName?.charAt(0)?.toUpperCase() || '';
    const apellido = this.usuario?.lastName?.charAt(0)?.toUpperCase() || '';
    return `${nombre}${apellido}`;
  }

  hasImage(): boolean {
    return !!this.imagePreview;
  }

  onBack(): void {
    this.router.navigate(['/']);
  }

  override ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    super.ngOnDestroy();
  }
}
