import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseDto } from '@base/models/api/response.dto';
import { BaseService } from '@base/services/base.service';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { GetTipoDeporte } from '../model/getTipoDeporte.model';

@Injectable({
  providedIn: 'root'
})
export class TipoDeporteService extends BaseService {

  constructor(http: HttpClient) {
    super(http, `${environment.backend.baseApiUrl}/TipoDeporte`);
  }

  SelectCombo(): Observable<ResponseDto<GetTipoDeporte[]>> {
    return this.getRequest<ResponseDto<GetTipoDeporte[]>>(`/selectcombo`);
  }

}
