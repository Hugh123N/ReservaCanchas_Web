import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoginModel } from '../models/login.model';
import { GetUserModel } from '../models/get-user.model';
import { CreateUserModel } from '../models/create-user.model';
import { UpdateUserModel } from '../models/update-user.model';
import { SearchUserModel } from '../models/search-user.model';
import { AccessTokenModel } from '../models/access-token.model';
import { LoginResultModel } from '../models/login-result.model';
import { BaseService } from '@base/services/base.service';
import { environment } from '@environments/environment';
import { ResponseDto } from '@base/models/api/response.dto';
import { ResetPasswordModel } from '../models/reset-password.model';
import { ApplicationUserModel } from '../models/application-user.model';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { QueryResultsModel } from '@base/models/query/query-results.model';

@Injectable()
export class UsersService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.backend.baseApiSecurityUrl}/user`);
  }

  createUser(body: CreateUserModel): Observable<ResponseDto<ApplicationUserModel>> {
    return this.postRequest<CreateUserModel, ResponseDto<ApplicationUserModel>>(``, body);
  }

  updateUser(body: UpdateUserModel): Observable<ResponseDto<ApplicationUserModel>> {
    return this.putRequest<UpdateUserModel, ResponseDto<ApplicationUserModel>>(``, body);
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

  renewSession(): Observable<ResponseDto<AccessTokenModel>> {
    return this.getRequest<ResponseDto<AccessTokenModel>>(`/renew-session`);
  }

  forgotPassword(email: string): Observable<ResponseBaseDto> {
    return this.getRequest<ResponseBaseDto>(`/forgot-password/${email}`);
  }

  resetPassword(body: ResetPasswordModel): Observable<ResponseBaseDto> {
    return this.postRequest<ResetPasswordModel, ResponseBaseDto>(`/reset-password`, body);
  }

  logout(): Observable<ResponseBaseDto> {
    let response = new ResponseBaseDto();
    response.isValid = true;
    return of(response);
  }

  logoutSession(_: string): Observable<ResponseBaseDto> {
    let response = new ResponseBaseDto();
    response.isValid = true;
    return of(response);
  }
}
