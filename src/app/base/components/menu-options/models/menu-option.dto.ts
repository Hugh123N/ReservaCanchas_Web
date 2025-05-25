export class MenuOptionDto {
  applicationId: string = '';
  actionId: string = '';
  parentMenuOptionId: string = '';
  code: string = '';
  name: string = '';
  description: string = '';
  menuUri: string = '';
  menuIcon: string = '';
  sortOrder: number = 0;
  actionCode: string = '';
  children: MenuOptionDto[] = [];
}
