import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { BaseService } from '@base/services/base.service';
import { Observable } from 'rxjs';
import { GetActionModel } from '../models/get-action.model';
import { ListActionModel } from '../models/list-action.model';
import { CreateActionModel } from '../models/create-action.model';
import { UpdateActionModel } from '../models/update-action.model';
import { SearchActionModel } from '../models/search-action.model';
import { ResponseDto } from '@base/models/api/response.dto';
import { QueryResultsModel } from '@base/models/query/query-results.model';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';

@Injectable()
export class ActionsService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.backend.baseApiUrl}/action`);
  }

  create(body: CreateActionModel): Observable<ResponseDto<GetActionModel>> {
    return this.postRequest<CreateActionModel, ResponseDto<GetActionModel>>(``, body);
  }

  update(body: UpdateActionModel): Observable<ResponseDto<GetActionModel>> {
    return this.putRequest<UpdateActionModel, ResponseDto<GetActionModel>>(``, body);
  }

  inactivate(id: string): Observable<ResponseBaseDto> {
    return this.putRequest<null, ResponseBaseDto>(`inactivate/${id}`, null);
  }

  delete(id: string): Observable<ResponseBaseDto> {
    return this.deleteRequest<ResponseBaseDto>(`/${id}`);
  }

  get(id: string): Observable<ResponseDto<GetActionModel>> {
    return this.getRequest<ResponseDto<GetActionModel>>(`/${id}`);
  }

  list(): Observable<ResponseDto<ListActionModel[]>> {
    return this.getRequest<ResponseDto<ListActionModel[]>>(`/list`);
  }

  listByModule(moduleId: string): Observable<ResponseDto<ListActionModel[]>> {
    return this.getRequest<ResponseDto<ListActionModel[]>>(`/${moduleId}/list`);
  }

  listByApplication(applicationId: string): Observable<ResponseDto<ListActionModel[]>> {
    return this.getRequest<ResponseDto<ListActionModel[]>>(`/${applicationId}/list`);
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<SearchActionModel>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<SearchActionModel>>>(`/search`, body);
  }
}
