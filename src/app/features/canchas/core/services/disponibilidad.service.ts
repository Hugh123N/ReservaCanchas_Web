import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseDto } from '@base/models/api/response.dto';
import { BaseService } from '@base/services/base.service';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { CreateCancha } from '../model/createCancha.model';
import { UpdateCancha } from '../model/updateCancha.model';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { RequestDisponibilidad } from '../model/disponibilidad/requestDisponibilidad.model';
import { GetDisponibilidad } from '../model/disponibilidad/getDisponibilidad.model';
import { UpdateDisponibilidad } from '../model/disponibilidad/updateDisponibilidad.model';
import { CreateDisponibilidad } from '../model/disponibilidad/createDisponibilidad.model';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService extends BaseService {

  constructor(http: HttpClient) {
    super(http, `${environment.backend.baseApiUrl}/Disponibilidad`);
  }

  get(id: number): Observable<ResponseDto<GetDisponibilidad>> {
    return this.getRequest<ResponseDto<GetDisponibilidad>>(`/${id}`);
  }

  create(body: CreateDisponibilidad): Observable<ResponseDto<GetDisponibilidad>> {
    return this.postRequest<CreateDisponibilidad, ResponseDto<GetDisponibilidad>>(``, body);
  }

  update(body: UpdateDisponibilidad): Observable<ResponseDto<GetDisponibilidad>> {
    return this.putRequest<UpdateDisponibilidad, ResponseDto<GetDisponibilidad>>(``, body);
  }

  delete(id: number): Observable<ResponseBaseDto> {
    return this.deleteRequest<ResponseBaseDto>(`/${id}`);
  }

  horarioDisponible(body: RequestDisponibilidad): Observable<ResponseDto<string[]>> {
    return this.postRequest<RequestDisponibilidad, ResponseDto<string[]>>(`/horarioDisponible`, body);
  }

}
