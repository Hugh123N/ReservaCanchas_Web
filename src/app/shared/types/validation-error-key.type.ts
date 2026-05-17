export type ValidationErrorKeyType =
  | 'required'
  | 'minlength'
  | 'maxlength'
  | 'pattern'
  | 'email'
  | 'max'
  | 'min'
  // Validadores personalizados
  | 'passwordMismatch'
  | 'invalidPhone'
  | 'invalidDate'
  | 'dateInPast'
  | 'dateInFuture';