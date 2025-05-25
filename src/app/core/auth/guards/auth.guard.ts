// Angular
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
// RxJS
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
// Services
import { AuthService } from '../services/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionService } from '@base/permissions/services/permission.service'
import { environment } from '@environments/environment';
import { PermissionModel } from '@base/permissions/models/permission.model';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private permissionService: PermissionService,
    private ngxPermissionsService: NgxPermissionsService
  ) {

  }

  canActivate(route: ActivatedRouteSnapshot, _: RouterStateSnapshot): Observable<boolean> {
    if (this.authService.isAuthenticated()) {
      return this.permissionService.userPermissions(environment.application.code).pipe(
        map(result => {
          let permissions = result.data.map((permission: PermissionModel) => permission.actionCode);
          this.ngxPermissionsService.flushPermissions();
          this.ngxPermissionsService.loadPermissions(permissions);

          let permissionsVersion = sessionStorage.getItem('permissionsVersion') ?? '';
          let updateMenuConfig = permissionsVersion != `${permissions.length}`;
          sessionStorage.setItem('updateMenuConfig', `${updateMenuConfig}`);
          sessionStorage.setItem('permissionsVersion', `${permissions.length}`);
          return true;
        }));
    }

    this.router.navigate(['user/login']);

    return of(false);
  }
}
