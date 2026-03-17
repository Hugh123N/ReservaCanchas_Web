import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

/**
 * Validador de grupo para verificar que password y confirmPassword coincidan.
 * Se aplica a nivel de FormGroup.
 */
export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  };
}
