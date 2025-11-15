import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-social-buttons',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-social-section">
      <button
        mat-stroked-button
        class="auth-social-btn google"
        type="button"
        (click)="onGoogleClick()"
        [disabled]="isLoading"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          class="auth-social-icon"
        />
        <span>{{ buttonText }} Google</span>
      </button>

      <button
        mat-stroked-button
        class="auth-social-btn facebook"
        type="button"
        (click)="onFacebookClick()"
        [disabled]="isLoading"
      >
        <mat-icon class="auth-social-icon">facebook</mat-icon>
        <span>{{ buttonText }} Facebook</span>
      </button>
    </div>
  `,
  styles: []
})
export class AuthSocialButtonsComponent {
  @Input() isLoading: boolean = false;
  @Input() mode: 'login' | 'register' = 'login';

  @Output() googleClick = new EventEmitter<void>();
  @Output() facebookClick = new EventEmitter<void>();

  onGoogleClick(): void {
    if (!this.isLoading) {
      this.googleClick.emit();
    }
  }

  onFacebookClick(): void {
    if (!this.isLoading) {
      this.facebookClick.emit();
    }
  }

  get buttonText(): string {
    return this.mode === 'login' ? 'Continuar con' : 'Continuar con';
  }
}
