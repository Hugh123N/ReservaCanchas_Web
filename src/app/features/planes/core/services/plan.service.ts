import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '@base/services/base.service';
import { ResponseDto } from '@base/models/api/response.dto';
import { environment } from '@environments/environment';
import { ListPlaneDto } from '../models/plan.model';

@Injectable({ providedIn: 'root' })
export class PlanService extends BaseService {

  constructor(http: HttpClient) {
    super(http, `/Plane`);
  }

  getPlanes(): Observable<ResponseDto<ListPlaneDto[]>> {
    return this.getRequest<ResponseDto<ListPlaneDto[]>>('/list');
  }
}
