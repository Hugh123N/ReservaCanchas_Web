import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseDto } from '@base/models/api/response.dto';
import { BaseService } from '@base/services/base.service';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { GetCancha } from '../model/getCancha.model';
import { CreateCancha } from '../model/createCancha.model';
import { UpdateCancha } from '../model/updateCancha.model';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { QueryResultsModel } from '@base/models/query/query-results.model';
import { SearchCancha } from '../model/searchCancha.model';

@Injectable({
  providedIn: 'root'
})
export class CanchaService extends BaseService {

  constructor(http: HttpClient) {
    super(http, `${environment.backend.baseApiUrl}/Cancha`);
  }

  get(id: number): Observable<ResponseDto<GetCancha>> {
    return this.getRequest<ResponseDto<GetCancha>>(`/${id}`);
  }

  create(body: CreateCancha): Observable<ResponseDto<GetCancha>> {
    return this.postRequest<CreateCancha, ResponseDto<GetCancha>>(``, body);
  }

  update(body: UpdateCancha): Observable<ResponseDto<GetCancha>> {
    return this.putRequest<UpdateCancha, ResponseDto<GetCancha>>(``, body);
  }

  delete(id: number): Observable<ResponseBaseDto> {
    return this.deleteRequest<ResponseBaseDto>(`/${id}`);
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<SearchCancha>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<SearchCancha>>>(`/search`, body);
  }

}
