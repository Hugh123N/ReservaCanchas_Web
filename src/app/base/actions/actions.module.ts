// Angular
import { NgModule } from '@angular/core';
// Modules
import { TranslateModule } from '@ngx-translate/core';
import { ActionsRoutingModule } from './actions-routing.module';
// Components
// Service
import { ActionsService } from './services/actions.service';

@NgModule({
  imports: [
    ActionsRoutingModule,
    TranslateModule.forChild(),
  ],
  exports: [
  ],
  providers: [
    ActionsService,
  ],
  declarations: [
  ]
})
export class ActionsModule {

}
