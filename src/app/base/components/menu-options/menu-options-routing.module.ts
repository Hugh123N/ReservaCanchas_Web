import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { RouterModule, Routes } from '@angular/router';
import { PAGES_ROUTE } from '@shared/model/pages-route';

const routes: Routes = [
  {
    path: '',
    canActivate: [NgxPermissionsGuard],
    data: { permissions: { only: ['menu-options.search'], redirectTo: PAGES_ROUTE.PAGE_401 } },
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ],
})
export class MenuOptionsRoutingModule {

}
