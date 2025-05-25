import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { BaseService } from '@base/services/base.service';
import { Observable } from 'rxjs';
import { GetApplicationModel } from '../models/get-application.model';
import { ListApplicationModel } from '../models/list-application.model';
import { CreateApplicationModel } from '../models/create-application.model';
import { UpdateApplicationModel } from '../models/update-application.model';
import { ResponseDto } from '@base/models/api/response.dto';
import { QueryResultsModel } from '@base/models/query/query-results.model';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { SearchApplicationModel } from '../models/search-application.model';

@Injectable()
export class ApplicationsService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.backend.baseApiUrl}/application`);
  }

  create(body: CreateApplicationModel): Observable<ResponseDto<GetApplicationModel>> {
    return this.postRequest<CreateApplicationModel, ResponseDto<GetApplicationModel>>(``, body);
  }

  update(body: UpdateApplicationModel): Observable<ResponseDto<GetApplicationModel>> {
    return this.putRequest<UpdateApplicationModel, ResponseDto<GetApplicationModel>>(``, body);
  }

  inactivate(id: string): Observable<ResponseBaseDto> {
    return this.putRequest<null, ResponseBaseDto>(`inactivate/${id}`, null);
  }

  delete(id: string): Observable<ResponseBaseDto> {
    return this.deleteRequest<ResponseBaseDto>(`/${id}`);
  }

  get(id: string): Observable<ResponseDto<GetApplicationModel>> {
    return this.getRequest<ResponseDto<GetApplicationModel>>(`/${id}`);
  }

  list(): Observable<ResponseDto<ListApplicationModel[]>> {
    return this.getRequest<ResponseDto<ListApplicationModel[]>>(`/list`);
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<SearchApplicationModel>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<SearchApplicationModel>>>(`/search`, body);
  }
}
