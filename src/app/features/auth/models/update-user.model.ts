export class UpdateUserModel {
    id?: string = '';
    userName?: string = '';
    firstName?: string = '';
    lastName?: string = '';
    email?: string = '';
    phoneNumber?: string = '';
    imagen?: string = '';
    activo: boolean = true;
    roleIds: string[] = [];
}
