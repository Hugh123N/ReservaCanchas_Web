import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '@base/users/models/user';
import { UsersService } from '@base/users/services/users.service';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { environment } from '@environments/environment';

@Injectable()
export class AuthService {
  user$: Subject<User>;
  access_token_key = `access_token_${environment.application.code}`;

  constructor(private router: Router, private usersService: UsersService) {
    this.user$ = new Subject<User>();
  }

  public loadUserProfile() {
    let claims = this.getUserClaims();
    if (claims) {
      const user = new User();

      user.id = claims.UserId;
      user.email = claims.Email == 'no_information' ? '' : claims.Email;
      user.username = claims.UserName;
      user.fullname = claims.DisplayName;

      this.user$.next(user);
    }
  }

  public getUserClaims(): any {
    let access_token = this.getToken();
    if (access_token) return jwtDecode(access_token);
    return null;
  }

  public getToken(): string | null {
    return localStorage.getItem(this.access_token_key);
  }

  public isAuthenticated(): boolean {
    let claims = this.getUserClaims();
    var isValid = claims != null && claims != undefined;
    if (isValid && claims.ApplicationCode == environment.application.code) {
      return isValid;
    } else {
      return false;
    }
  }

  public logIn(accessToken: any): void {
    if (accessToken) {
      if (accessToken.access_token) {
        localStorage.setItem(this.access_token_key, accessToken.access_token);
        this.loadUserProfile();
      }
    }
  }

  public logOut(): Observable<ResponseBaseDto> {
    return this.usersService.logout().pipe(
      map((result: ResponseBaseDto) => {
        if (result.isValid) {
          this.cleanAndRedirect();
        }
        return result;
      })
    );
  }

  public logoutSession(): void {
    let userClaims = this.getUserClaims();
    if (userClaims) {
      let logId = userClaims.LogId ?? userClaims.logId;
      if (logId) {
        this.usersService.logoutSession(logId).subscribe(
          (_: any) => {},
          (_: any) => {},
          () => {
            this.cleanAndRedirect();
          }
        );
      } else {
        this.cleanAndRedirect();
      }
    } else {
      this.cleanAndRedirect();
    }
  }

  public cleanAndRedirect() {
    localStorage.removeItem('menuConfigV1');
    localStorage.removeItem(this.access_token_key);
    sessionStorage.clear();
    this.router.navigate(['user/login']);
  }

  public getUserClaim(claimName: string): any {
    return null;
  }

  public getRoles(): string[] {
    let claims = this.getUserClaims();
    return Array.isArray(claims.role)
      ? claims.role
      : claims.role
      ? [claims.role]
      : [];
  }

  public hasRole(roleName: string) {
    var role = this.getRoles().find((x) => x === roleName);
    return role !== null && role !== undefined && role !== '';
  }

  public saveCredentials(processId: string, password: string) {
    sessionStorage.setItem(processId, password);
  }

  public getCredentials(processId: string): string | null {
    return sessionStorage.getItem(processId);
  }

  public getRemoveCredentials(_: string) {
    sessionStorage.clear();
  }

  public keepAlive() {
    let access_token = this.getToken();
    if (access_token) {
      let tokeninfo = JSON.parse(atob(access_token.split('.')[1]));
      let exp = parseInt(tokeninfo.exp);

      let actual = new Date();
      let expiration = new Date(exp * 1000);
      var seconds_between = (+expiration - +actual) / 1000;

      if (seconds_between <= 300) {
        //5 minutes before session expires
        this.usersService.renewSession().subscribe((response: ResponseBaseDto) => {
          if (response) {
            if (response.data) {
              if (response.data.access_token) {
                localStorage.setItem(
                  this.access_token_key,
                  response.data.access_token
                );
                this.loadUserProfile();
              }
            }
          }
        });
      }
    }
  }
}
