// Angular
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
// Service
import { PermissionService } from './services/permission.service';

@NgModule({
  imports: [
    TranslateModule.forChild(),
  ],
  exports: [
  ],
  providers: [
    PermissionService,
  ],
  declarations: [
  ]
})
export class PermissionsModule {

}
