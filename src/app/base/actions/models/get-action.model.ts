import { ActionModel } from "./action.model";

export class GetActionModel extends ActionModel {
    id: string = '';
    moduleCode: string = '';
    moduleName: string = '';
    isActive: boolean = false;
}
