import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeRequests = 0;
  private _loading = signal(false);
  private _message = signal('Cargando...');

  readonly loading = this._loading.asReadonly();
  readonly message = this._message.asReadonly();

  show(message: string = 'Cargando...'): void {
    this.activeRequests++;
    this._message.set(message);
    this._loading.set(true);
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      this._loading.set(false);
      this._message.set('Cargando...');
    }
  }

  forceHide(): void {
    this.activeRequests = 0;
    this._loading.set(false);
    this._message.set('Cargando...');
  }

  isLoading(): boolean {
    return this._loading();
  }
}
