import { defer, Observable, shareReplay, tap } from 'rxjs';
import { ResponseDto } from '@base/models/api/response.dto';

export class CachedResponse<T> {
  private response$?: Observable<ResponseDto<T>>;
  private expiresAt = Infinity;

  constructor(
    private readonly request: () => Observable<ResponseDto<T>>,
    private readonly maxAgeMs = Infinity
  ) {}

  get(): Observable<ResponseDto<T>> {
    if (this.isExpired()) {
      this.clear();
    }

    if (!this.response$) {
      const request$ = defer(this.request).pipe(
        tap({
          next: response => {
            if (!response.isValid || response.data == null) {
              this.clearIfCurrent(request$);
            } else if (this.response$ === request$) {
              this.expiresAt = Date.now() + this.maxAgeMs;
            }
          },
          error: () => this.clearIfCurrent(request$)
        }),
        // La carga pertenece al servicio y debe terminar aunque se abandone la vista.
        shareReplay({ bufferSize: 1, refCount: false })
      );
      this.response$ = request$;
    }

    return this.response$;
  }

  clear(): void {
    this.response$ = undefined;
    this.expiresAt = Infinity;
  }

  isExpired(): boolean {
    return Date.now() >= this.expiresAt;
  }

  private clearIfCurrent(request$: Observable<ResponseDto<T>>): void {
    // Una petición anterior no debe invalidar una carga iniciada después de clear().
    if (this.response$ === request$) {
      this.clear();
    }
  }
}
