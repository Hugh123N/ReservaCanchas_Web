import { PermissionModel } from "./permission.model";

export class RolePermissionModel {
  moduleCode: string = '';
  moduleName: string = '';
  permissions: PermissionModel[] = [];
}
