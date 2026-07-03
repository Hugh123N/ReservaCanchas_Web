import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { TypedFormGroup } from '@shared/types/types-form';
import { UserProfileFormModel } from '../models/user-profile-form.model';
import { GetUserModel } from 'app/features/auth/models/get-user.model';

export class UserProfileFormMapper {

  static initForm(fb: FormBuilder): TypedFormGroup<UserProfileFormModel> {
    return fb.group<{ [K in keyof UserProfileFormModel]: FormControl<UserProfileFormModel[K]> }>({
      firstName: fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
      lastName: fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
      userName: fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
      email: fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      phoneNumber: fb.control('', { nonNullable: true, validators: [Validators.pattern(/^(\+51|51)?[9][0-9]{8}$/)] })
    });
  }

  static fillForm(form: TypedFormGroup<UserProfileFormModel>, user: GetUserModel | null): void {
    form.patchValue({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      userName: user?.userName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || ''
    });
    form.controls.userName.disable();
  }
}
