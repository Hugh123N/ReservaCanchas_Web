import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-message',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    @if (message) {
      <div [class]="cssClass">
        <mat-icon class="mr-2">{{ iconName }}</mat-icon>
        <span>{{ message }}</span>
      </div>
    }
  `,
  styles: []
})
export class AuthMessageComponent {
  @Input() type: 'error' | 'success' | 'warning' = 'error';
  @Input() message: string = '';

  get iconName(): string {
    switch (this.type) {
      case 'error':
        return 'error_outline';
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }

  get cssClass(): string {
    switch (this.type) {
      case 'error':
        return 'error-message';
      case 'success':
        return 'success-message';
      case 'warning':
        return 'warning-message';
      default:
        return 'info-message';
    }
  }
}
