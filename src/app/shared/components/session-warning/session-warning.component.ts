import { Component, OnInit, OnDestroy, Output, EventEmitter, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertBannerComponent, AlertAction } from '../alert-banner/alert-banner.component';
import { SessionExpiryService } from '@core/services/session-expiry.service';
import { AuthService } from '@core/auth/services/auth.service';

@Component({
  selector: 'app-session-warning',
  standalone: true,
  imports: [CommonModule, AlertBannerComponent],
  template: `
    <app-alert-banner
      [type]="'warning'"
      [visible]="showWarning"
      [template]="sessionTemplate"
      [actions]="sessionActions"
      (actionClick)="onSessionAction($event)">

      <ng-template #sessionTemplate>
        Tu sesión expira en <strong>{{ minutesRemaining }} minuto{{ minutesRemaining !== 1 ? 's' : '' }}</strong>
      </ng-template>
    </app-alert-banner>
  `
})
export class SessionWarningComponent implements OnInit, OnDestroy {
  @Output() logout = new EventEmitter<void>();

  showWarning = false;
  minutesRemaining = 0;

  sessionActions: AlertAction[] = [
    { label: 'Mantener sesión', action: 'extend', class: 'btn-outline-accent' },
    { label: 'Cerrar ahora', action: 'logout', class: 'btn-outline-accent' }
  ];

  constructor(
    private sessionExpiryService: SessionExpiryService,
    private authService: AuthService
  ) {
    effect(() => {
      this.showWarning = this.sessionExpiryService.showWarning();
    });

    effect(() => {
      this.minutesRemaining = this.sessionExpiryService.minutesRemaining();
    });
  }

  ngOnInit(): void {}

  onSessionAction(action: AlertAction): void {
    if (action.action === 'extend') {
      this.sessionExpiryService.stopWatching();
      this.authService.keepAlive((newToken) => {
        this.sessionExpiryService.startWatching(newToken);
      });
    } else if (action.action === 'logout') {
      this.logout.emit();
    }
  }

  ngOnDestroy(): void {}
}
