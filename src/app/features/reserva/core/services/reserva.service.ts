import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseDto } from '@base/models/api/response.dto';
import { BaseService } from '@base/services/base.service';
import { Observable } from 'rxjs';
import { GetReserva } from '../model/getReserva.model';
import { CreateReserva } from '../model/createReserva.model';
import { UpdateReserva } from '../model/updateReserva.model';
import { ListReserva } from '../model/listReserva.model';
import { SearchReserva } from '../model/searchReserva.model';
import { SearchReservaFilter } from '../model/searchReservaFilter.model';
import { SelectComboReserva } from '../model/selectComboReserva.model';
import { SelectReserva } from '../model/selectReserva.model';
import { SelectReservaFilter } from '../model/selectReservaFilter.model';
import { ReservaConPagoDto } from '../model/reservaConPago.model';
import { ReservaClienteDto } from '../model/reservaCliente.model';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { QueryResultsModel } from '@base/models/query/query-results.model';

@Injectable({
  providedIn: 'root'
})
export class ReservaService extends BaseService {

  constructor(http: HttpClient) {
    super(http, `/Reserva`);
  }

  create(body: CreateReserva): Observable<ResponseDto<ReservaConPagoDto>> {
    return this.postRequest<CreateReserva, ResponseDto<ReservaConPagoDto>>(``, body);
  }

  update(body: UpdateReserva): Observable<ResponseDto<GetReserva>> {
    return this.putRequest<UpdateReserva, ResponseDto<GetReserva>>(``, body);
  }

  delete(id: number): Observable<ResponseBaseDto> {
    return this.deleteRequest<ResponseBaseDto>(`/${id}`);
  }

  get(id: number): Observable<ResponseDto<GetReserva>> {
    return this.getRequest<ResponseDto<GetReserva>>(`/${id}`);
  }

  list(id: number): Observable<ResponseDto<ListReserva[]>> {
    return this.postRequest<number, ResponseDto<ListReserva[]>>(`/list`, id);
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<SearchReserva>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<SearchReserva>>>(`/search`, body);
  }

  selectCombo(): Observable<ResponseDto<SelectComboReserva[]>> {
    return this.getRequest<ResponseDto<SelectComboReserva[]>>(`/selectcombo`);
  }

  select(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<SelectReserva>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<SelectReserva>>>(`/select`, body);
  }

  /**
   * Buscar las reservas del cliente con filtros y paginación
   * Endpoint: POST /api/Reserva/mis-reservas/{idUsuario}
   */
  searchMisReservas(idUsuario: string, searchParams: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<ReservaClienteDto>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<ReservaClienteDto>>>(
      `/mis-reservas/${idUsuario}`,
      searchParams
    );
  }
}
