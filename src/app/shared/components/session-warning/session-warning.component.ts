import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { SessionExpiryService } from '@core/services/session-expiry.service';
import { AuthService } from '@core/auth/services/auth.service';

@Component({
  selector: 'app-session-warning', standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (auth.authenticated() && session.showWarning()) {
      <aside class="session-warning" role="alert" aria-labelledby="session-warning-title">
        <div class="session-warning-heading"><mat-icon aria-hidden="true">timer</mat-icon><h2 id="session-warning-title">Tu sesión está por vencer</h2></div>
        <p>Se cerrará en <strong>{{ session.minutesRemaining() }} minuto{{ session.minutesRemaining() !== 1 ? 's' : '' }}</strong>. ¿Quieres mantenerla abierta?</p>
        @if (auth.renewalError()) { <p class="session-warning-error">{{ auth.renewalError() }}</p> }
        <div class="session-warning-actions">
          <button type="button" class="btn-outline-primary" (click)="cerrarSesion()">Cerrar ahora</button>
          <button type="button" class="btn-primary" [disabled]="auth.isRenewing()" [attr.aria-busy]="auth.isRenewing()" (click)="mantenerSesion()">{{ auth.isRenewing() ? 'Renovando…' : 'Mantener sesión' }}</button>
        </div>
      </aside>
    }
  `,
  styleUrl: './session-warning.component.css'
})
export class SessionWarningComponent implements OnDestroy {
  readonly session = inject(SessionExpiryService);
  readonly auth = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  mantenerSesion(): void { this.auth.keepAlive().pipe(takeUntil(this.destroy$)).subscribe(); }
  cerrarSesion(): void { this.auth.logoutSession(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
