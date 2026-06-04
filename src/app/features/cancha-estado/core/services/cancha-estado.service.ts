import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseDto } from '@base/models/api/response.dto';
import { BaseService } from '@base/services/base.service';

import { Observable } from 'rxjs';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { QueryResultsModel } from '@base/models/query/query-results.model';
import { GetEstadoCancha } from '../model/getEstadoCancha.model';

@Injectable({
  providedIn: 'root'
})
export class CanchaEstadoService extends BaseService {

  constructor(http: HttpClient) {
    super(http, `/EstadoCancha`);
  }

  SelectCombo(): Observable<ResponseDto<GetEstadoCancha[]>> {
    return this.getRequest<ResponseDto<GetEstadoCancha[]>>(`/selectcombo`);
  }

}
