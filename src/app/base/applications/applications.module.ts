// Angular
import { NgModule } from '@angular/core';
// Modules
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationsRoutingModule } from './applications-routing.module';
// Service
import { ApplicationsService } from './services/applications.service';

@NgModule({
  imports: [
    ApplicationsRoutingModule,
    TranslateModule.forChild(),
  ],
  providers: [
    ApplicationsService
  ],
  declarations: [
  ]
})
export class ApplicationsModule {

}
