import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseDto } from '@base/models/api/response.dto';
import { BaseService } from '@base/services/base.service';
import { CachedResponse } from '@base/services/cached-response';

import { Observable } from 'rxjs';
import { GetTipoDeporte } from '../model/getTipoDeporte.model';

@Injectable({
  providedIn: 'root'
})
export class TipoDeporteService extends BaseService {
  private readonly deportesCache = new CachedResponse<GetTipoDeporte[]>(
    () => this.getRequest<ResponseDto<GetTipoDeporte[]>>('/selectcombo')
  );

  constructor(http: HttpClient) {
    super(http, `/TipoDeporte`);
  }

  SelectCombo(): Observable<ResponseDto<GetTipoDeporte[]>> {
    return this.deportesCache.get();
  }

  clearCache(): void {
    this.deportesCache.clear();
  }

}
