import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { RouterModule, Routes } from '@angular/router';
import { PAGES_ROUTE } from '@shared/model/pages-route';
// components

const routes: Routes = [
  {
    path: '',
    canActivate: [NgxPermissionsGuard],
    data: { permissions: { only: ['users.search'], redirectTo: PAGES_ROUTE.PAGE_401 } },
  },
  {
    path: 'new',
    canActivate: [NgxPermissionsGuard],
    data: { permissions: { only: ['users.create'], redirectTo: PAGES_ROUTE.PAGE_401 } },
  },
  {
    path: 'edit/:id',
    canActivate: [NgxPermissionsGuard],
    data: { permissions: { only: ['users.edit'], redirectTo: PAGES_ROUTE.PAGE_401 } },
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
export class UsersRoutingModule {

}
