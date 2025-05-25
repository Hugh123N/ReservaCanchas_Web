// Angular
import { NgModule } from '@angular/core';
// Translate
import { TranslateModule } from '@ngx-translate/core';
// Modules
import { UsersRoutingModule } from './users-routing.module';
// Components
// Services
import { UsersService } from './services/users.service';

@NgModule({
	imports: [
		UsersRoutingModule,
		TranslateModule.forChild(),
	],
	providers: [
		UsersService,
	],
	declarations: [
	]
})
export class UsersModule {

}
