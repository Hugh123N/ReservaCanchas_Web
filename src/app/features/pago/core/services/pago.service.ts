import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseDto } from '@base/models/api/response.dto';
import { BaseService } from '@base/services/base.service';

import { Observable } from 'rxjs';
import { GetPago } from '../model/getPago.model';
import { CreatePago } from '../model/createPago.model';
import { UpdatePago } from '../model/updatePago.model';
import { ListPago } from '../model/listPago.model';
import { SearchPago } from '../model/searchPago.model';
import { SearchPagoFilter } from '../model/searchPagoFilter.model';
import { SelectComboPago } from '../model/selectComboPago.model';
import { SelectPago } from '../model/selectPago.model';
import { SelectPagoFilter } from '../model/selectPagoFilter.model';
import { ConfirmarPago } from '../model/confirmarPago.model';
import { CompletarPago } from '../model/completarPago.model';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { QueryResultsModel } from '@base/models/query/query-results.model';

@Injectable({
  providedIn: 'root'
})
export class PagoService extends BaseService {

  constructor(http: HttpClient) {
    super(http, `/Pago`);
  }

  create(body: CreatePago): Observable<ResponseDto<GetPago>> {
    return this.postRequest<CreatePago, ResponseDto<GetPago>>(``, body);
  }

  update(body: UpdatePago): Observable<ResponseDto<GetPago>> {
    return this.putRequest<UpdatePago, ResponseDto<GetPago>>(``, body);
  }

  delete(id: number): Observable<ResponseBaseDto> {
    return this.deleteRequest<ResponseBaseDto>(`/${id}`);
  }

  get(id: number): Observable<ResponseDto<GetPago>> {
    return this.getRequest<ResponseDto<GetPago>>(`/${id}`);
  }

  list(id: number): Observable<ResponseDto<ListPago[]>> {
    return this.postRequest<number, ResponseDto<ListPago[]>>(`/list`, id);
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<SearchPago>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<SearchPago>>>(`/search`, body);
  }

  selectCombo(): Observable<ResponseDto<SelectComboPago[]>> {
    return this.getRequest<ResponseDto<SelectComboPago[]>>(`/selectcombo`);
  }

  select(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<SelectPago>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<SelectPago>>>(`/select`, body);
  }

  confirmarPago(body: ConfirmarPago): Observable<ResponseDto<GetPago>> {
    return this.postRequest<ConfirmarPago, ResponseDto<GetPago>>(`/confirmar`, body);
  }

  completarPago(body: CompletarPago): Observable<ResponseDto<GetPago>> {
    return this.postRequest<CompletarPago, ResponseDto<GetPago>>(`/completar-pago`, body);
  }
}
