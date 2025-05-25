// Angular
import { NgModule } from '@angular/core'
// Modules
import { TranslateModule } from '@ngx-translate/core';
import { MenuOptionsRoutingModule } from './menu-options-routing.module';
// Services
import { ModulesService } from '@base/modules/services/modules.service';
import { ActionsService } from '@base/actions/services/actions.service';
import { MenuOptionsService } from './services/menu-options.service';
import { ApplicationsService } from '@base/applications/services/applications.service';

@NgModule({
  imports: [
    MenuOptionsRoutingModule,
    TranslateModule.forChild(),
  ],
  providers: [
    ModulesService,
    ActionsService,
    MenuOptionsService,
    ApplicationsService,
  ],
  declarations: [
  ]
})
export class MenuOptionsModule {

}
