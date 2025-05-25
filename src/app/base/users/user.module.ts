// Angular
import { NgModule } from '@angular/core';
// Translate
import { TranslateModule } from '@ngx-translate/core';
// Modules
import { UserRoutingModule } from './user-routing.module';
// Components
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
/*
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/components/forgot-password.component';
*/
// Modules
import { UsersService } from './services/users.service';
@NgModule({
	imports: [
		UserRoutingModule,
		TranslateModule.forChild(),
	],
	providers: [
		UsersService,
	],
	declarations: [
		/*
		ForgotPasswordComponent,
		ResetPasswordComponent,
		*/
	]
})
export class UserModule {

}
