import { MenuOptionDto } from "./menu-option.dto";

export class UpdateMenuOptionModel extends MenuOptionDto {
  id: string = '';
  isActive: boolean = false;
}
