---
name: formularios
description: Formularios reactivos, validaciones, FormErrorComponent y helpers de BaseComponent
---

## 1. Creación de FormGroup

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordMatchValidator } from '@shared/validators/password-match-validator';

miFormulario: FormGroup;

constructor(private fb: FormBuilder) {
  this.miFormulario = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
    ]],
    confirmPassword: ['', [Validators.required]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
    estado: ['pendiente'],
    aceptoTerminos: [false, [Validators.requiredTrue]]
  }, {
    validators: passwordMatchValidator()
  });
}
```

---

## 2. Validadores Disponibles

| Validador | Uso | Ejemplo |
|-----------|-----|---------|
| `Validators.required` | Campo obligatorio | `['', [Validators.required]]` |
| `Validators.email` | Formato email | `['', [Validators.email]]` |
| `Validators.minLength(n)` | Mínimo n caracteres | `[Validators.minLength(6)]` |
| `Validators.maxLength(n)` | Máximo n caracteres | `[Validators.maxLength(100)]` |
| `Validators.pattern(regex)` | Patrón regex | `[Validators.pattern(/^\d{8}$/)]` |
| `Validators.min(n)` | Valor mínimo numérico | `[Validators.min(1)]` |
| `Validators.max(n)` | Valor máximo numérico | `[Validators.max(100)]` |
| `Validators.requiredTrue` | Debe ser true | `[Validators.requiredTrue]` |
| `passwordMatchValidator()` | Passwords coinciden | `validators: passwordMatchValidator()` |

---

## 3. Validador Personalizado

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function miValidador(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;

    if (!valor) {
      return null;
    }

    const esValido = /* condición de validación */;

    return esValido ? null : { miError: true };
  };
}
```

---

## 4. Errores en Templates

**REGLA OBLIGATORIA**: Usar SIEMPRE el componente `FormErrorComponent` para mostrar errores de validación.

```html
<div class="mb-4">
  <label class="form-label">
    Email <span class="form-label-required">*</span>
  </label>
  <input class="input-base" formControlName="email" type="email" />
  <app-form-error [control]="miFormulario.get('email')"></app-form-error>
</div>

<div class="mb-4">
  <label class="form-label">
    Contraseña <span class="form-label-required">*</span>
  </label>
  <input class="input-base" formControlName="password" type="password" />
  <app-form-error [control]="miFormulario.get('password')"></app-form-error>
</div>
```

**Componente FormErrorComponent**: `src/app/shared/components/form-error/form-error.component.ts`

---

## 5. Validación al Enviar

```typescript
onSubmit(): void {
  if (!this.validateForm(this.miFormulario)) {
    return;
  }

  const datos = this.miFormulario.value as MiModel;

  this.fetchById<MiModel>(this.miService.create(datos), (response) => {
    this.openSuccessAlert('Creado exitosamente');
  });
}
```

**Helpers de BaseComponent** (ver skill servicios para detalles completos):

```typescript
// Para arrays - llena un array target con la respuesta
this.fetchData<T>(observable, targetArray)

// Para objetos individuales - callback con la data
this.fetchById<T>(observable, (data) => { this.item = data; })
```

---

## 6. Resetear Formulario

```typescript
resetForm(): void {
  this.miFormulario.reset({
    nombre: '',
    email: '',
    telefono: '',
    estado: 'pendiente'
  });
}
```

---

## 7. Más Info

Para directivas y componentes → skill("angular-core")
Para estilos de formularios → skill("estilos")
Para patrones de dialog con formulario → skill("patrones")
