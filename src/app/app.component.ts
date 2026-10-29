import { Component, OnInit, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from '@core/services/loading.service';
import { AuthService } from '@core/auth/services/auth.service';
import { SessionWarningComponent } from '@shared/components/session-warning/session-warning.component';
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SessionWarningComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'court-reservation-public';
  loadingService = inject(LoadingService);
  private readonly auth = inject(AuthService);
  private readonly dialogs = inject(Dialog);

  constructor() { effect(() => { if (!this.auth.authenticated()) this.dialogs.closeAll(); }); }
  ngOnInit(): void { this.auth.initializeSession(); }
}
