import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseDto } from '@base/models/api/response.dto';
import { BaseService } from '@base/services/base.service';

import { Observable } from 'rxjs';
import { GetCancha } from '../model/getCancha.model';
import { CreateCancha } from '../model/createCancha.model';
import { UpdateCancha } from '../model/updateCancha.model';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { QueryResultsModel } from '@base/models/query/query-results.model';
import { Departamento } from '../model/ubigeo/departamento.model';
import { Ubigeo } from '../model/ubigeo/ubigeo.model';

@Injectable({
  providedIn: 'root'
})
export class UbigeoService extends BaseService {

  constructor(http: HttpClient) {
    super(http, `/Ubigeo`);
  }

  list(): Observable<ResponseDto<Departamento[]>> {
    return this.getRequest<ResponseDto<Departamento[]>>(`/list`);
  }

  listAll(): Observable<ResponseDto<Ubigeo[]>> {
    return this.getRequest<ResponseDto<Ubigeo[]>>(`/listAll`);
  }

}
