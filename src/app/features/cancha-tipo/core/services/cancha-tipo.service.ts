import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseDto } from '@base/models/api/response.dto';
import { BaseService } from '@base/services/base.service';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { GetTipoCancha } from '../model/getTipoCancha.model';

@Injectable({
  providedIn: 'root'
})
export class CanchaTipoService extends BaseService {

  constructor(http: HttpClient) {
    super(http, `${environment.backend.baseApiUrl}/TipoCancha`);
  }

  SelectCombo(): Observable<ResponseDto<GetTipoCancha[]>> {
    return this.getRequest<ResponseDto<GetTipoCancha[]>>(`/selectcombo`);
  }

}
