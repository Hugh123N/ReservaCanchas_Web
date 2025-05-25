import { UserModel } from "./user.model";

export class GetUserModel extends UserModel {
    id: string = '';
    isActive: boolean = false;
}
