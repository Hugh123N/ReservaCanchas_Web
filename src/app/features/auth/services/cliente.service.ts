import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '@base/services/base.service';
import { ResponseDto } from '@base/models/api/response.dto';
import { CreateUserModel } from '../models/create-user.model';
import { GetClienteModel } from '../models/get-cliente.model';
import { UpdateClienteModel } from '../models/update-cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService extends BaseService {
  constructor(http: HttpClient) {
    super(http, '/Cliente');
  }

  create(body: CreateUserModel): Observable<ResponseDto<GetClienteModel>> {
    return this.postRequest<CreateUserModel, ResponseDto<GetClienteModel>>('', body);
  }

  update(body: UpdateClienteModel): Observable<ResponseDto<GetClienteModel>> {
    return this.putRequest<UpdateClienteModel, ResponseDto<GetClienteModel>>('', body);
  }
}
