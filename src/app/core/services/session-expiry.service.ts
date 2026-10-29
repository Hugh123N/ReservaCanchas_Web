import { Injectable, signal, OnDestroy, NgZone, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { decodeSessionToken } from '@core/auth/utils/session-token.utils';

@Injectable({ providedIn: 'root' })
export class SessionExpiryService implements OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly warning = signal(false);
  private readonly minutes = signal(0);
  private readonly expiration = signal<Date | null>(null);
  private readonly expired$ = new Subject<void>();
  private timer?: ReturnType<typeof setInterval>;
  readonly showWarning = this.warning.asReadonly();
  readonly minutesRemaining = this.minutes.asReadonly();
  readonly tokenExpiration = this.expiration.asReadonly();
  readonly sessionExpired = this.expired$.asObservable();

  constructor(private ngZone: NgZone) {}

  startWatching(token: string): void {
    if (!this.isBrowser) return;
    this.stopWatching();
    const claims = decodeSessionToken(token);
    if (!claims) {
      this.ngZone.run(() => this.expired$.next());
      return;
    }
    this.expiration.set(new Date(claims.exp * 1000));
    this.checkNow();
    if (this.expiration()) {
      this.ngZone.runOutsideAngular(() => { this.timer = setInterval(() => this.checkNow(), 1000); });
    }
  }

  checkNow(): void {
    const expiration = this.expiration();
    if (!expiration) return;
    const timeLeft = expiration.getTime() - Date.now();
    if (timeLeft <= 0) {
      this.stopWatching();
      this.ngZone.run(() => this.expired$.next());
      return;
    }
    const minutes = Math.ceil(timeLeft / 60_000);
    const warning = timeLeft <= 5 * 60_000;
    if (minutes !== this.minutes() || warning !== this.warning()) {
      this.ngZone.run(() => { this.minutes.set(minutes); this.warning.set(warning); });
    }
  }

  stopWatching(): void {
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
    this.warning.set(false);
    this.minutes.set(0);
    this.expiration.set(null);
  }

  ngOnDestroy(): void { this.stopWatching(); this.expired$.complete(); }
}
