import { HttpClient } from '@angular/common/http';
import { RequestDisponibilidad } from '../model/disponibilidad/requestDisponibilidad.model';
import { BaseService } from '@base/services/base.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ResponseDto } from '@base/models/api/response.dto';
import { GetHorarioCancha } from '../model/horarioCancha/gethorarioCancha.model';

@Injectable({
  providedIn: 'root'
})
export class HorarioCanchaService extends BaseService {

  constructor(http: HttpClient) {
    super(http, `/HorarioCancha`);
  }

  horarioDisponible(body: RequestDisponibilidad): Observable<ResponseDto<GetHorarioCancha[]>> {
    return this.postRequest<RequestDisponibilidad, ResponseDto<GetHorarioCancha[]>>(`/horarioDisponible`, body);
  }
}
