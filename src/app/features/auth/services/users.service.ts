import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpContext } from '@angular/common/http';
import { SKIP_LOADING } from '@core/interceptors/loading.interceptor';
import { LoginModel } from '../models/login.model';
import { GetUserModel } from '../models/get-user.model';
import { SearchUserModel } from '../models/search-user.model';
import { AccessTokenModel } from '../models/access-token.model';
import { LoginResultModel } from '../models/login-result.model';
import { BaseService } from '@base/services/base.service';
import { ResponseDto } from '@base/models/api/response.dto';
import { ResetPasswordModel } from '../models/reset-password.model';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { QueryResultsModel } from '@base/models/query/query-results.model';
import { UpdateTelefonoUser } from '../models/updateTelefonoUser.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService extends BaseService {
  constructor(http: HttpClient) {
    super(http, '/Usuario');
  }

  deleteUser(id: string): Observable<ResponseBaseDto> {
    return this.deleteRequest<ResponseBaseDto>(`/${id}`);
  }

  getUser(id: string): Observable<ResponseDto<GetUserModel>> {
    return this.getRequest<ResponseDto<GetUserModel>>(`/${id}`);
  }

  searchUsers(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<SearchUserModel>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<SearchUserModel>>>(`/search`, body);
  }

  login(loginDto: LoginModel): Observable<ResponseDto<LoginResultModel>> {
    return this.postRequest<LoginModel, ResponseDto<LoginResultModel>>(`/login`, loginDto);
  }

  loginWithOAuth(provider: 'Google' | 'Facebook', idToken: string): Observable<ResponseDto<LoginResultModel>> {
    const body = {
      applicationCode: 'Cliente',
      email: null,
      password: null,
      idToken: idToken,
      typeValidation: provider
    };
    return this.postRequest<any, ResponseDto<LoginResultModel>>(`/client/loginAndCreate`, body);
  }

  renewSession(): Observable<ResponseDto<AccessTokenModel>> {
    // El aviso muestra su propio progreso y permite cerrar mientras se renueva.
    return this.getRequest<ResponseDto<AccessTokenModel>>(`/renew-session`, new HttpContext().set(SKIP_LOADING, true));
  }

  forgotPassword(email: string, host: string): Observable<ResponseBaseDto> {
    return this.getRequest<ResponseBaseDto>(`/forgot-password/${email}/${host}`);
  }

  resetPassword(body: ResetPasswordModel): Observable<ResponseBaseDto> {
    return this.postRequest<ResetPasswordModel, ResponseBaseDto>(`/reset-password`, body);
  }

  updateTelefono(body: UpdateTelefonoUser): Observable<ResponseBaseDto> {
    return this.putRequest<UpdateTelefonoUser, ResponseBaseDto>(`/telefono`, body);
  }

  logout(): Observable<ResponseBaseDto> {
    const response = new ResponseBaseDto();
    response.isValid = true;
    return of(response);
  }

  logoutSession(_: string): Observable<ResponseBaseDto> {
    let response = new ResponseBaseDto();
    response.isValid = true;
    return of(response);
  }
}
