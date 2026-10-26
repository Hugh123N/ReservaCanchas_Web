import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseDto } from '@base/models/api/response.dto';
import { BaseService } from '@base/services/base.service';
import { CachedResponse } from '@base/services/cached-response';

import { Observable } from 'rxjs';
import { Departamento } from '../model/ubigeo/departamento.model';
import { Ubigeo } from '../model/ubigeo/ubigeo.model';

@Injectable({
  providedIn: 'root'
})
export class UbigeoService extends BaseService {
  private readonly ubigeosCache = new CachedResponse<Ubigeo[]>(
    () => this.getRequest<ResponseDto<Ubigeo[]>>('/listAll')
  );

  constructor(http: HttpClient) {
    super(http, `/Ubigeo`);
  }

  list(): Observable<ResponseDto<Departamento[]>> {
    return this.getRequest<ResponseDto<Departamento[]>>(`/list`);
  }

  listAll(): Observable<ResponseDto<Ubigeo[]>> {
    return this.ubigeosCache.get();
  }

  clearCache(): void {
    this.ubigeosCache.clear();
  }

}
