import { Observable, Subject, takeUntil } from 'rxjs';
import { Injectable, Injector, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from 'app/features/auth/models/user';
import { UsersService } from 'app/features/auth/services/users.service';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { environment } from '@environments/environment';
import { SessionExpiryService } from '@core/services/session-expiry.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Subject<User>;
  access_token_key = `access_token_${environment.application.code}`;
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private usersService: UsersService,
    private injector: Injector,
    private sessionExpiryService: SessionExpiryService
  ) {
    this.user$ = new Subject<User>();
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.sessionExpiryService.sessionExpired
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.logoutSession();
      });
  }

  public loadUserProfile() {
    let claims = this.getUserClaims();
    if (claims) {
      const user = new User();

      user.id = claims.UserId;
      user.email = claims.email == 'no_information' ? '' : claims.email;
      user.username = claims.UserName;
      user.fullname = claims.DisplayName;
      user.telefono = claims.Telefono == 'no_information' ? '' : claims.Telefono;

      this.user$.next(user);

      return user;
    }
    return null;
  }

  public getUserClaims(): any {
    let access_token = this.getToken();
    if (access_token) return jwtDecode(access_token);
    return null;
  }

  public getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.access_token_key);
  }

  public isAuthenticated(): boolean {
    let claims = this.getUserClaims();
    var isValid = claims != null && claims != undefined;
    if (isValid /*&& claims.ApplicationCode == environment.application.code*/) {
      return isValid;
    } else {
      return false;
    }
  }

  public async logIn(accessToken: any): Promise<void> {
    if (!this.isBrowser) return;
    if (accessToken) {
      if (accessToken.access_token) {
        localStorage.setItem(this.access_token_key, accessToken.access_token);
        this.loadUserProfile();

        this.sessionExpiryService.startWatching(accessToken.access_token);

        try {
          const { CanchaFavoritaService } = await import('app/features/canchas/core/services/cancha-favorita.service');
          const favoritosService = this.injector.get(CanchaFavoritaService);
          await favoritosService.cargarFavoritosUsuario();
        } catch (error) {
          console.error('Error al cargar favoritos en login:', error);
        }
      }
    }
  }

  public logOut(): Observable<ResponseBaseDto> {
    return this.usersService.logout().pipe(
      map((result) => {
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
          (_: any) => { },
          (_: any) => { },
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

  public async cleanAndRedirect(): Promise<void> {
    if (!this.isBrowser) return;
    
    this.sessionExpiryService.stopWatching();

    try {
      const { CanchaFavoritaService } = await import('app/features/canchas/core/services/cancha-favorita.service');
      const favoritosService = this.injector.get(CanchaFavoritaService);
      favoritosService.limpiarFavoritos();
    } catch (error) {
      console.error('Error al limpiar favoritos en logout:', error);
    }

    localStorage.removeItem(this.access_token_key);
    sessionStorage.clear();
    this.router.navigate(['auth/login']);
  }

  public getUserClaim(claimName: string): any {
    return null;
  }

  public getRoles(): string[] {
    let claims = this.getUserClaims();
    if (!claims) return [];

    const roles = claims.Roles || claims.roles || claims.role;

    return Array.isArray(roles)
      ? roles
      : roles
        ? [roles]
        : [];
  }

  public hasRole(roleName: string) {
    var role = this.getRoles().find((x) => x === roleName);
    return role !== null && role !== undefined && role !== '';
  }

  public saveCredentials(processId: string, password: string) {
    if (!this.isBrowser) return;
    sessionStorage.setItem(processId, password);
  }

  public getCredentials(processId: string): string | null {
    if (!this.isBrowser) return null;
    return sessionStorage.getItem(processId);
  }

  public getRemoveCredentials(_: string) {
    if (!this.isBrowser) return;
    sessionStorage.clear();
  }

  public keepAlive(onRenewed?: (newToken: string) => void): void {
    if (!this.isBrowser) return;

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
                if (onRenewed) {
                  onRenewed(response.data.access_token);
                }
              }
            }
          }
        });
      }
    }
  }
}
