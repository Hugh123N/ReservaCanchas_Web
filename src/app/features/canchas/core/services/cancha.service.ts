import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseDto } from '@base/models/api/response.dto';
import { BaseService } from '@base/services/base.service';
import { CachedResponse } from '@base/services/cached-response';

import { map, Observable, tap, throwError } from 'rxjs';
import { GetCancha } from '../model/getCancha.model';
import { CreateCancha } from '../model/createCancha.model';
import { UpdateCancha } from '../model/updateCancha.model';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { QueryResultsModel } from '@base/models/query/query-results.model';
import { SearchCancha } from '../model/searchCancha.model';

@Injectable({
  providedIn: 'root'
})
export class CanchaService extends BaseService {
  private readonly detalleMaxAgeMs = 5 * 60 * 1000;
  private readonly maxDetallesCache = 20;
  private readonly detallesCache = new Map<number, CachedResponse<GetCancha>>();

  constructor(http: HttpClient) {
    super(http, `/Cancha`);
  }

  get(id: number): Observable<ResponseDto<GetCancha>> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      return throwError(() => new Error('El ID de la cancha no es válido.'));
    }

    for (const [key, entry] of this.detallesCache) {
      if (entry.isExpired()) this.detallesCache.delete(key);
    }

    let cache = this.detallesCache.get(id);
    if (!cache) {
      cache = new CachedResponse<GetCancha>(
        () => this.getRequest<ResponseDto<GetCancha>>(`/${id}`),
        this.detalleMaxAgeMs
      );
    }

    this.detallesCache.delete(id);
    this.detallesCache.set(id, cache);
    if (this.detallesCache.size > this.maxDetallesCache) {
      const oldest = this.detallesCache.keys().next().value;
      if (oldest !== undefined) this.detallesCache.delete(oldest);
    }

    return cache.get().pipe(
      // Cada vista recibe su copia para no modificar el detalle compartido.
      map(response => ({ ...response, data: structuredClone(response.data) }))
    );
  }

  clearCache(id?: number): void {
    if (id === undefined) {
      this.detallesCache.clear();
    } else {
      this.detallesCache.delete(id);
    }
  }

  create(body: CreateCancha): Observable<ResponseDto<GetCancha>> {
    return this.postRequest<CreateCancha, ResponseDto<GetCancha>>(``, body);
  }

  update(body: UpdateCancha): Observable<ResponseDto<GetCancha>> {
    return this.putRequest<UpdateCancha, ResponseDto<GetCancha>>(``, body).pipe(
      tap(response => { if (response.isValid) this.clearCache(body.idCancha); })
    );
  }

  delete(id: number): Observable<ResponseBaseDto> {
    return this.deleteRequest<ResponseBaseDto>(`/${id}`).pipe(
      tap(response => { if (response.isValid) this.clearCache(id); })
    );
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<SearchCancha>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<SearchCancha>>>(`/search`, body);
  }

}
