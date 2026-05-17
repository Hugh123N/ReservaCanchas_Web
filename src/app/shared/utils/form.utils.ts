import { AbstractControl, FormGroup } from '@angular/forms';
import { ValidationErrorKeyType } from '@shared/types/validation-error-key.type';
import { FieldValidationMessagesType } from '@shared/types/field-validation-messages.type';

/**
 * Mensajes de error por defecto para validaciones comunes.
 * Pueden ser sobrescritos pasando mensajes personalizados.
 */
export const DEFAULT_VALIDATION_MESSAGES: Record<ValidationErrorKeyType, string | ((error: any) => string)> = {
  required: 'Este campo es obligatorio',
  email: 'Ingresa un email válido',
  minlength: (error) => `Mínimo ${error?.requiredLength || 0} caracteres`,
  maxlength: (error) => `Máximo ${error?.requiredLength || 0} caracteres`,
  min: (error) => `El valor mínimo es ${error?.min || 0}`,
  max: (error) => `El valor máximo es ${error?.max || 0}`,
  pattern: 'El formato no es válido',
  passwordMismatch: 'Las contraseñas no coinciden',
  invalidPhone: 'Ingresa un teléfono válido',
  invalidDate: 'Ingresa una fecha válida',
  dateInPast: 'La fecha no puede ser en el pasado',
  dateInFuture: 'La fecha no puede ser en el futuro',
};

/**
 * Valida un formulario y marca todos los controles como touched.
 * Útil para mostrar todos los errores antes de submit.
 *
 * @param form - FormGroup a validar
 * @returns true si el formulario es válido, false si no
 *
 * @example
 * ```typescript
 * onSubmit(): void {
 *   if (!validateForm(this.form)) {
 *     return;
 *   }
 *   // Continuar con submit
 * }
 * ```
 */
export function validateForm(form: FormGroup): boolean {
  if (form.invalid) {
    markAllAsTouched(form);
    return false;
  }
  return true;
}

/**
 * Marca todos los controles de un FormGroup como touched recursivamente.
 *
 * @param control - FormGroup o AbstractControl a marcar
 */
export function markAllAsTouched(control: AbstractControl): void {
  if (control instanceof FormGroup) {
    Object.keys(control.controls).forEach(key => {
      markAllAsTouched(control.controls[key]);
    });
  }
  control.markAsTouched();
}

/**
 * Obtiene el primer mensaje de error de un control de formulario.
 *
 * @param control - Control del formulario (puede ser null)
 * @param customMessages - Mensajes personalizados opcionales
 * @returns Mensaje de error o null si no hay errores
 *
 * @example
 * ```typescript
 * // Con mensajes por defecto
 * const error = getControlError(form.get('email'));
 *
 * // Con mensajes personalizados
 * const error = getControlError(form.get('email'), {
 *   required: 'El email es obligatorio',
 *   email: 'Formato de email inválido'
 * });
 * ```
 */
export function getControlError(
  control: AbstractControl | null,
  customMessages?: FieldValidationMessagesType
): string | null {
  if (!control || !control.errors || !control.touched) {
    return null;
  }

  const errorKeys = Object.keys(control.errors) as ValidationErrorKeyType[];

  for (const key of errorKeys) {
    // Primero buscar en mensajes personalizados
    if (customMessages && customMessages[key]) {
      return customMessages[key]!;
    }

    // Luego usar mensajes por defecto
    const defaultMessage = DEFAULT_VALIDATION_MESSAGES[key];
    if (defaultMessage) {
      if (typeof defaultMessage === 'function') {
        return defaultMessage(control.errors![key]);
      }
      return defaultMessage;
    }
  }

  // Mensaje genérico si no se encuentra
  return 'Campo inválido';
}

/**
 * Obtiene el mensaje de error de un campo específico del formulario.
 *
 * @param form - FormGroup del formulario
 * @param fieldName - Nombre del campo
 * @param customMessages - Mensajes personalizados opcionales
 * @returns Mensaje de error o null si no hay errores
 *
 * @example
 * ```typescript
 * const error = getFieldError(this.form, 'email');
 * const error = getFieldError(this.form, 'password', { minlength: 'La contraseña es muy corta' });
 * ```
 */
export function getFieldError(
  form: FormGroup,
  fieldName: string,
  customMessages?: FieldValidationMessagesType
): string | null {
  const control = form.get(fieldName);
  return getControlError(control, customMessages);
}

/**
 * Verifica si un campo tiene un error específico y está touched.
 *
 * @param form - FormGroup del formulario
 * @param fieldName - Nombre del campo
 * @param errorKey - Clave del error a verificar
 * @returns true si el campo tiene el error y está touched
 *
 * @example
 * ```typescript
 * if (hasFieldError(this.form, 'email', 'required')) {
 *   // Mostrar error de requerido
 * }
 * ```
 */
export function hasFieldError(
  form: FormGroup,
  fieldName: string,
  errorKey: ValidationErrorKeyType
): boolean {
  const control = form.get(fieldName);
  return !!(control?.hasError(errorKey) && control?.touched);
}

/**
 * Verifica si un campo es inválido y está touched.
 *
 * @param form - FormGroup del formulario
 * @param fieldName - Nombre del campo
 * @returns true si el campo es inválido y está touched
 *
 * @example
 * ```typescript
 * [class.border-red-500]="isFieldInvalid(form, 'email')"
 * ```
 */
export function isFieldInvalid(form: FormGroup, fieldName: string): boolean {
  const control = form.get(fieldName);
  return !!(control?.invalid && control?.touched);
}

/**
 * Resetea un formulario y opcionalmente establece valores por defecto.
 *
 * @param form - FormGroup a resetear
 * @param defaultValues - Valores por defecto opcionales
 */
export function resetForm(form: FormGroup, defaultValues?: any): void {
  form.reset(defaultValues);
  form.markAsPristine();
  form.markAsUntouched();
}
