import { ApplicationUserRoleModel } from "./application-user-role.model";

export class ApplicationUserModel {
    userName: string = '';
    email: string = '';
    firstName: string = '';
    lastName: string = '';
    enabled: boolean = false;
    roleId: string = '';
    id: string = '';
    role: ApplicationUserRoleModel = new ApplicationUserRoleModel();
}
