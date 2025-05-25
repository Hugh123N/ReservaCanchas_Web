import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PermissionModel } from '../models/permission.model';
import { BaseService } from '@base/services/base.service';
import { environment } from '@environments/environment';
import { ResponseDto } from '@base/models/api/response.dto';
import { RolePermissionModel } from '../models/role-permission.model';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';

@Injectable()
export class PermissionService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.backend.baseApiSecurityUrl}/permission`);
  }

  assign(roleId: string, actionIds: string[]): Observable<ResponseBaseDto> {
    return this.postRequest<string[], ResponseBaseDto>(`/${roleId}/assign`, actionIds);
  }

  rolePermissions(roleId: string): Observable<ResponseDto<RolePermissionModel[]>> {
    return this.getRequest<ResponseDto<RolePermissionModel[]>>(`/${roleId}/role-permissions`);
  }

  userPermissions(applicationCode: string): Observable<ResponseDto<PermissionModel[]>> {
    return this.getRequest<ResponseDto<PermissionModel[]>>(`/${applicationCode}/user-permissions`);
  }
}
