import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '@base/services/base.service';
import { ResponseDto } from '@base/models/api/response.dto';
import { environment } from '@environments/environment';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { GetMenuOptionModel } from '../models/get-menu-option.model';
import { CreateMenuOptionModel } from '../models/create-menu-option.model';
import { UpdateMenuOptionModel } from '../models/update-menu-option.model';

@Injectable()
export class MenuOptionsService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.backend.baseApiSecurityUrl}/menu-option`);
  }

  create(body: CreateMenuOptionModel): Observable<ResponseDto<GetMenuOptionModel>> {
    return this.postRequest<CreateMenuOptionModel, ResponseDto<GetMenuOptionModel>>(``, body);
  }

  update(body: UpdateMenuOptionModel): Observable<ResponseDto<GetMenuOptionModel>> {
    return this.putRequest<UpdateMenuOptionModel, ResponseDto<GetMenuOptionModel>>(``, body);
  }

  inactivate(id: string): Observable<ResponseBaseDto> {
    return this.putRequest<null, ResponseBaseDto>(`inactivate/${id}`, null);
  }

  delete(id: string): Observable<ResponseBaseDto> {
    return this.deleteRequest<ResponseBaseDto>(`/${id}`);
  }

  get(id: string): Observable<ResponseDto<GetMenuOptionModel>> {
    return this.getRequest<ResponseDto<GetMenuOptionModel>>(`/${id}`);
  }

  list(applicationCode: string): Observable<ResponseDto<GetMenuOptionModel[]>> {
    return this.getRequest<ResponseDto<GetMenuOptionModel[]>>(`/${applicationCode}/list`);
  }

  listAll(applicationCode: string): Observable<ResponseDto<GetMenuOptionModel[]>> {
    return this.getRequest<ResponseDto<GetMenuOptionModel[]>>(`/${applicationCode}/list-all`);
  }

  listTree(applicationCode: string): Observable<ResponseDto<GetMenuOptionModel[]>> {
    return this.getRequest<ResponseDto<GetMenuOptionModel[]>>(`/${applicationCode}/tree`);
  }

  listTreeAll(applicationCode: string): Observable<ResponseDto<GetMenuOptionModel[]>> {
    return this.getRequest<ResponseDto<GetMenuOptionModel[]>>(`/${applicationCode}/tree-all`);
  }
}
