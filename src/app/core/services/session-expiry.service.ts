import { Injectable, signal, OnDestroy, NgZone, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class SessionExpiryService implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  private _showWarning = signal<boolean>(false);
  private _minutesRemaining = signal<number>(0);
  private _tokenExpiration = signal<Date | null>(null);

  readonly showWarning = this._showWarning.asReadonly();
  readonly minutesRemaining = this._minutesRemaining.asReadonly();
  readonly tokenExpiration = this._tokenExpiration.asReadonly();

  private sessionExpired$ = new Subject<void>();
  sessionExpired = this.sessionExpired$.asObservable();

  private readonly WARNING_MINUTES = 5;
  private checkInterval: any = null;
  private countdownInterval: any = null;

  constructor(private ngZone: NgZone) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  startWatching(token: string): void {
    if (!this.isBrowser) return;

    this.stopWatching();

    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp * 1000;
      this._tokenExpiration.set(new Date(exp));

      this.ngZone.runOutsideAngular(() => {
        this.checkInterval = setInterval(() => {
          this.checkExpiration(exp);
        }, 30000);
      });

      this.checkExpiration(exp);
    } catch (error) {
      console.error('Error al decodificar token:', error);
    }
  }

  stopWatching(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this._showWarning.set(false);
    this._minutesRemaining.set(0);
    this._tokenExpiration.set(null);
  }

  private checkExpiration(expTimestamp: number): void {
    const now = Date.now();
    const timeLeft = expTimestamp - now;
    const minutesLeft = Math.ceil(timeLeft / 60000);

    if (timeLeft <= 0) {
      this.stopWatching();
      this.ngZone.run(() => {
        this.sessionExpired$.next();
      });
      return;
    }

    if (minutesLeft <= this.WARNING_MINUTES && !this._showWarning()) {
      this._showWarning.set(true);
      this.startCountdown(timeLeft);
    }

    this._minutesRemaining.set(minutesLeft);
  }

  private startCountdown(timeLeftMs: number): void {
    let remaining = timeLeftMs;

    this.ngZone.runOutsideAngular(() => {
      this.countdownInterval = setInterval(() => {
        remaining -= 60000;
        const minutes = Math.ceil(remaining / 60000);

        this._minutesRemaining.set(minutes > 0 ? minutes : 0);

        if (remaining <= 0) {
          this.stopWatching();
          this.ngZone.run(() => {
            this.sessionExpired$.next();
          });
        }
      }, 60000);
    });
  }

  hideWarning(): void {
    this._showWarning.set(false);

    
  }

  ngOnDestroy(): void {
    this.stopWatching();
  }
}
