import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { getControlError } from '@shared/utils/form.utils';
import { FieldValidationMessagesType } from '@shared/types/field-validation-messages.type';

/**
 * Componente reutilizable para mostrar errores de validación de formularios.
 *
 * Muestra automáticamente el primer error de validación cuando el control
 * está touched y tiene errores.
 *
 * @example
 * ```html
 * <!-- Uso básico -->
 * <app-form-error [control]="form.get('email')"></app-form-error>
 *
 * <!-- Con mensajes personalizados -->
 * <app-form-error
 *   [control]="form.get('email')"
 *   [messages]="{ required: 'El email es obligatorio' }">
 * </app-form-error>
 *
 * <!-- Con clase personalizada -->
 * <app-form-error
 *   [control]="form.get('email')"
 *   styleClass="text-red-600 text-xs mt-2">
 * </app-form-error>
 * ```
 */
@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (errorMessage) {
      <p [class]="styleClass">{{ errorMessage }}</p>
    }
  `
})
export class FormErrorComponent {
  /**
   * Control del formulario a validar
   */
  @Input() control: AbstractControl | null = null;

  /**
   * Mensajes personalizados para sobrescribir los mensajes por defecto
   */
  @Input() messages?: FieldValidationMessagesType;

  /**
   * Clase CSS para el mensaje de error
   * @default 'text-red-500 text-sm mt-1'
   */
  @Input() styleClass: string = 'text-red-500 text-sm mt-1';

  /**
   * Obtiene el mensaje de error actual del control
   */
  get errorMessage(): string | null {
    return getControlError(this.control, this.messages);
  }
}
