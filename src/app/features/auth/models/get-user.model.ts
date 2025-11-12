import { UserModel } from "./user.model";

export class GetUserModel extends UserModel {
    id: string = '';
    idEstadoUsuario?: number;
    activo: boolean = false;
}
