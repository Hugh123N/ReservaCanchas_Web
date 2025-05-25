import { MenuOptionDto } from "./menu-option.dto";

export class GetMenuOptionModel extends MenuOptionDto {
    id: string = '';
    applicationCode: string = '';
    applicationName: string = '';
    moduleId: string = '';
    moduleCode: string = '';
    moduleName: string = '';
    actionName: string = '';
    parentCode: string = '';
    parentName: string = '';
    isActive: boolean = false;
}
