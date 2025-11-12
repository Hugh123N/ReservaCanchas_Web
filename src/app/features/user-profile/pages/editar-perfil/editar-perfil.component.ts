import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseComponent } from '@base/components/base-component/base.component';
import { AuthService } from '@core/auth/services/auth.service';
import { UsersService } from 'app/features/auth/services/users.service';
import { GetUserModel } from 'app/features/auth/models/get-user.model';
import { UpdateUserModel } from 'app/features/auth/models/update-user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css'
})
export class EditarPerfilComponent extends BaseComponent implements OnInit {

  form!: FormGroup;
  usuario: GetUserModel | null = null;
  isLoading: boolean = false;
  isSaving: boolean = false;

  // Image handling
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  defaultAvatar: string = 'assets/images/default-avatar.png';

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
    this.buildForm();
    this.loadUserProfile();
  }

  /**
   * Construir formulario reactivo
   */
  buildForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^(\+51|51)?[9][0-9]{8}$/)]]
    });
  }

  /**
   * Cargar perfil del usuario autenticado
   */
  loadUserProfile(): void {
    const currentUser = this.authService.loadUserProfile();
    if (!currentUser || !currentUser.id) {
      this.openErrorAlert('No se pudo obtener el usuario autenticado');
      this.router.navigate(['/']);
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
            this.patchFormValues();
            if (this.usuario!.imagen) {
              this.imagePreview = this.usuario!.imagen;
            }
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
   * Rellenar formulario con datos actuales
   */
  patchFormValues(): void {
    if (!this.usuario) return;

    this.form.patchValue({
      firstName: this.usuario.firstName || '',
      lastName: this.usuario.lastName || '',
      userName: this.usuario.userName || '',
      email: this.usuario.email || '',
      phoneNumber: this.usuario.phoneNumber || ''
    });
  }

  /**
   * Manejar selección de archivo de imagen
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.openWarningAlert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      const maxSizeMB = 5;
      if (file.size > maxSizeMB * 1024 * 1024) {
        this.openWarningAlert(`La imagen no debe superar ${maxSizeMB}MB`);
        return;
      }

      this.selectedFile = file;
      this.convertToBase64(file);
    }
  }

  /**
   * Convertir imagen a base64
   */
  convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Eliminar imagen seleccionada
   */
  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = this.usuario?.imagen || null;
    // Reset input file
    const inputFile = document.getElementById('imageInput') as HTMLInputElement;
    if (inputFile) {
      inputFile.value = '';
    }
  }

  /**
   * Obtener URL de imagen para preview
   */
  getImagePreviewUrl(): string {
    return this.imagePreview || this.defaultAvatar;
  }

  /**
   * Verificar si hay imagen para mostrar
   */
  hasImage(): boolean {
    return !!(this.imagePreview && this.imagePreview !== this.defaultAvatar);
  }

  /**
   * Guardar cambios
   */
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key =>
        this.form.controls[key].markAsTouched()
      );
      this.openWarningAlert('Por favor completa todos los campos requeridos correctamente');
      return;
    }

    const confirmed = await this.confirmAction(
      '¿Guardar cambios?',
      'Se actualizará tu información de perfil'
    );

    if (!confirmed) return;

    this.isSaving = true;

    const updateDto = new UpdateUserModel();
    updateDto.id = this.usuario!.id;
    updateDto.firstName = this.form.value.firstName;
    updateDto.lastName = this.form.value.lastName;
    updateDto.userName = this.form.value.userName;
    updateDto.email = this.form.value.email;
    updateDto.phoneNumber = this.form.value.phoneNumber || '';
    updateDto.imagen = this.imagePreview || '';
    updateDto.activo = this.usuario!.activo;
    updateDto.roleIds = this.usuario!.roleIds || [];

    const subscription = this.usersService
      .updateUser(updateDto)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (response) => {
          if (response.isValid) {
            this.openSuccessAlert('Perfil actualizado exitosamente');
            this.router.navigate(['/perfil']);
          } else {
            this.openErrorAlert(response || 'Error al actualizar el perfil');
          }
          this.isSaving = false;
        },
        error: (error) => {
          this.openErrorAlert(error || 'Error al actualizar el perfil');
          this.isSaving = false;
        }
      });

    this.subscriptions.push(subscription);
  }

  /**
   * Cancelar edición
   */
  onCancel(): void {
    this.router.navigate(['/perfil']);
  }

  override ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    super.ngOnDestroy();
  }
}
