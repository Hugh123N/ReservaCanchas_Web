import { Observable, Subject, catchError, defer, finalize, map, of, shareReplay, takeUntil, timeout } from 'rxjs';
import { Injectable, Injector, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from 'app/features/auth/models/user';
import { AccessTokenModel } from 'app/features/auth/models/access-token.model';
import { UsersService } from 'app/features/auth/services/users.service';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { environment } from '@environments/environment';
import { SessionExpiryService } from '@core/services/session-expiry.service';
import { getValidSessionClaims, SessionClaims } from '../utils/session-token.utils';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  readonly user$ = new Subject<User>();
  readonly access_token_key = `access_token_${environment.application.code}`;
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly injector = inject(Injector);
  private readonly sessionExpiryService = inject(SessionExpiryService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroy$ = new Subject<void>();
  private readonly cancelRenewal$ = new Subject<void>();
  private readonly signedIn = signal(false);
  private readonly renewing = signal(false);
  private readonly renewError = signal<string | null>(null);
  readonly authenticated = this.signedIn.asReadonly();
  readonly isRenewing = this.renewing.asReadonly();
  readonly renewalError = this.renewError.asReadonly();
  private initialized = false;
  private endingSession = false;
  private watchedToken: string | null = null;
  private renewal$?: Observable<boolean>;
  private sessionVersion = 0;

  private readonly onStorage = (event: StorageEvent): void => {
    if ((event.storageArea === null || event.storageArea === localStorage) && (event.key === this.access_token_key || event.key === null)) this.synchronizeSession();
  };
  private readonly onFocus = (): void => this.synchronizeSession();
  private readonly onVisibility = (): void => { if (document.visibilityState === 'visible') this.synchronizeSession(); };

  constructor() {
    this.sessionExpiryService.sessionExpired.pipe(takeUntil(this.destroy$)).subscribe(() => this.synchronizeSession());
  }

  initializeSession(): void {
    if (!this.isBrowser || this.initialized) return;
    this.initialized = true;
    window.addEventListener('storage', this.onStorage);
    window.addEventListener('focus', this.onFocus);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.synchronizeSession();
  }

  private synchronizeSession(): void {
    const token = this.getToken();
    if (!token) {
      if (this.watchedToken || this.signedIn()) this.logoutSession();
      else this.sessionExpiryService.stopWatching();
      return;
    }
    if (!getValidSessionClaims(token)) { this.logoutSession(); return; }
    if (token !== this.watchedToken) this.acceptToken(token);
    else this.sessionExpiryService.checkNow();
  }

  private acceptToken(token: string): void {
    this.cancelRenewal$.next();
    this.renewal$ = undefined;
    this.sessionVersion++;
    this.endingSession = false;
    this.watchedToken = token;
    this.signedIn.set(true);
    this.renewError.set(null);
    this.sessionExpiryService.startWatching(token);
    this.loadUserProfile();
  }

  loadUserProfile(): User | null {
    const claims = this.getUserClaims();
    if (!claims) return null;
    const user = new User();
    user.id = claims.UserId;
    user.idUserNegocio = claims.UserIdNegocio;
    user.email = claims.email === 'no_information' ? '' : claims.email;
    user.username = claims.UserName;
    user.fullname = claims.DisplayName;
    user.telefono = claims.Telefono === 'no_information' ? '' : claims.Telefono;
    user.roles = claims.Roles;
    this.user$.next(user);
    return user;
  }

  getUserClaims(): SessionClaims | null { return getValidSessionClaims(this.getToken()); }
  getToken(): string | null { return this.isBrowser ? localStorage.getItem(this.access_token_key) : null; }
  isAuthenticated(): boolean { return this.getUserClaims() !== null; }

  async logIn(accessToken: AccessTokenModel): Promise<void> {
    if (!this.isBrowser) return;
    if (!getValidSessionClaims(accessToken?.access_token)) throw new Error('La sesión recibida no es válida.');
    localStorage.setItem(this.access_token_key, accessToken.access_token);
    this.acceptToken(accessToken.access_token);
    try {
      const { CanchaFavoritaService } = await import('app/features/canchas/core/services/cancha-favorita.service');
      if (this.getToken() === accessToken.access_token) await this.injector.get(CanchaFavoritaService).cargarFavoritosUsuario();
    } catch {
      // La carga de favoritos no debe impedir iniciar una sesión válida.
    }
  }

  logOut(): Observable<ResponseBaseDto> {
    return defer(() => {
      this.logoutSession();
      const response = new ResponseBaseDto();
      response.isValid = true;
      return of(response);
    });
  }

  logoutSession(options: { redirect?: boolean } = {}): void {
    if (!this.isBrowser || this.endingSession) return;
    this.endingSession = true;
    const version = ++this.sessionVersion;
    this.cancelRenewal$.next();
    this.renewal$ = undefined;
    this.sessionExpiryService.stopWatching();
    this.watchedToken = null;
    localStorage.removeItem(this.access_token_key);
    sessionStorage.clear();
    this.signedIn.set(false);
    this.renewError.set(null);
    this.user$.next(new User());
    if (options.redirect !== false) void this.router.navigate(['/auth/login']);
    // La limpieza local y la navegación son inmediatas; los datos auxiliares se limpian después.
    void import('app/features/canchas/core/services/cancha-favorita.service').then(({ CanchaFavoritaService }) => {
      if (version === this.sessionVersion && !this.isAuthenticated()) this.injector.get(CanchaFavoritaService).limpiarFavoritos();
    }).catch(() => undefined);
  }

  async cleanAndRedirect(): Promise<void> { this.logoutSession(); }

  keepAlive(): Observable<boolean> {
    if (this.renewal$) return this.renewal$;
    const originalToken = this.getToken();
    const originalClaims = getValidSessionClaims(originalToken);
    if (!originalClaims) { this.logoutSession(); return of(false); }
    if (originalClaims.exp * 1000 - Date.now() > 5 * 60_000) {
      this.synchronizeSession();
      return of(true);
    }
    const request$ = defer(() => {
      this.renewing.set(true);
      this.renewError.set(null);
      return this.usersService.renewSession();
    }).pipe(
      timeout({ first: 15_000 }),
      map(response => {
        if (this.getToken() !== originalToken) return false;
        if (!getValidSessionClaims(originalToken)) { this.logoutSession(); return false; }
        const token: unknown = response.data?.access_token;
        const claims = typeof token === 'string' ? getValidSessionClaims(token) : null;
        if (typeof token !== 'string' || !response.isValid || !claims || claims.exp <= originalClaims.exp || claims.UserId !== originalClaims.UserId ||
            (originalClaims.UserIdNegocio > 0 && claims.UserIdNegocio !== originalClaims.UserIdNegocio)) {
          this.renewError.set('No pudimos renovar tu sesión. Intenta nuevamente antes de que venza.');
          return false;
        }
        localStorage.setItem(this.access_token_key, token);
        // El nuevo token se aplica sin cancelar la respuesta que lo acaba de renovar.
        this.sessionVersion++;
        this.watchedToken = token;
        this.sessionExpiryService.startWatching(token);
        this.loadUserProfile();
        return true;
      }),
      catchError((error: unknown) => {
        if (this.getToken() === originalToken) {
          if (error instanceof HttpErrorResponse && error.status === 401) this.logoutSession();
          else this.renewError.set('No pudimos renovar tu sesión. Comprueba tu conexión e inténtalo de nuevo.');
        }
        return of(false);
      }),
      takeUntil(this.cancelRenewal$), takeUntil(this.destroy$),
      finalize(() => { this.renewing.set(false); if (this.renewal$ === request$) this.renewal$ = undefined; }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    this.renewal$ = request$;
    return request$;
  }

  getUserClaim<K extends keyof SessionClaims>(claimName: K): SessionClaims[K] | undefined { return this.getUserClaims()?.[claimName]; }
  getRoles(): string[] { return this.getUserClaims()?.Roles ?? []; }
  hasRole(roleName: string): boolean { return this.getRoles().includes(roleName); }
  saveCredentials(processId: string, password: string): void { if (this.isBrowser) sessionStorage.setItem(processId, password); }
  getCredentials(processId: string): string | null { return this.isBrowser ? sessionStorage.getItem(processId) : null; }
  getRemoveCredentials(_: string): void { if (this.isBrowser) sessionStorage.clear(); }

  ngOnDestroy(): void {
    this.destroy$.next(); this.destroy$.complete();
    this.cancelRenewal$.complete();
    this.sessionExpiryService.stopWatching();
    this.user$.complete();
    if (this.isBrowser) {
      window.removeEventListener('storage', this.onStorage);
      window.removeEventListener('focus', this.onFocus);
      document.removeEventListener('visibilitychange', this.onVisibility);
    }
  }
}
