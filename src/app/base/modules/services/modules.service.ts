import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { BaseService } from '@base/services/base.service';
import { Observable } from 'rxjs';
import { GetModuleModel } from '../models/get-module.model';
import { ListModuleModel } from '../models/list-module.model';
import { CreateModuleModel } from '../models/create-module.model';
import { UpdateModuleModel } from '../models/update-module.model';
import { SearchModuleModel } from '../models/search-module.model';
import { ResponseDto } from '@base/models/api/response.dto';
import { QueryResultsModel } from '@base/models/query/query-results.model';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';

@Injectable()
export class ModulesService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.backend.baseApiUrl}/module`);
  }

  create(body: CreateModuleModel): Observable<ResponseDto<GetModuleModel>> {
    return this.postRequest<CreateModuleModel, ResponseDto<GetModuleModel>>(``, body);
  }

  update(body: UpdateModuleModel): Observable<ResponseDto<GetModuleModel>> {
    return this.putRequest<UpdateModuleModel, ResponseDto<GetModuleModel>>(``, body);
  }

  inactivate(id: string): Observable<ResponseBaseDto> {
    return this.putRequest<null, ResponseBaseDto>(`inactivate/${id}`, null);
  }

  delete(id: string): Observable<ResponseBaseDto> {
    return this.deleteRequest<ResponseBaseDto>(`/${id}`);
  }

  get(id: string): Observable<ResponseDto<GetModuleModel>> {
    return this.getRequest<ResponseDto<GetModuleModel>>(`/${id}`);
  }

  list(): Observable<ResponseDto<ListModuleModel[]>> {
    return this.getRequest<ResponseDto<ListModuleModel[]>>(`/list`);
  }

  listByApplication(applicationId: string): Observable<ResponseDto<ListModuleModel[]>> {
    return this.getRequest<ResponseDto<ListModuleModel[]>>(`/${applicationId}/list`);
  }

  listSimpleByApplication(applicationId: string): Observable<ResponseDto<ListModuleModel[]>> {
    return this.getRequest<ResponseDto<ListModuleModel[]>>(`/${applicationId}/list-simple`);
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<SearchModuleModel>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<SearchModuleModel>>>(`/search`, body);
  }
}
