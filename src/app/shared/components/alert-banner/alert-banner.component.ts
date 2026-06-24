import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface AlertAction {
  label: string;
  class?: string;
  action: string;
}

@Component({
  selector: 'app-alert-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    @if (visible) {
      <div [class]="bannerClass" [style.animation]="animation">
        <div class="alert-banner-content">
          <span class="alert-banner-text">
            @if (template) {
              <ng-container [ngTemplateOutlet]="template"></ng-container>
            } @else {
              {{ message }}
            }
          </span>
          <div class="alert-banner-actions">
            @for (action of actions; track action.label) {
              <button
                [class]="action.class || 'btn-outline-primary btn-sm'"
                (click)="onAction(action)">
                {{ action.label }}
              </button>
            }
            @if (dismissible) {
              <button class="alert-banner-dismiss" (click)="onDismiss()">
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './alert-banner.component.css'
})
export class AlertBannerComponent implements OnInit, OnDestroy {
  @Input() type: 'warning' | 'error' | 'info' | 'success' = 'warning';
  @Input() message: string = '';
  @Input() visible: boolean = false;
  @Input() template: TemplateRef<any> | null = null;
  @Input() actions: AlertAction[] = [];
  @Input() animation: string = 'slideDown 0.3s ease-out';
  @Input() dismissible: boolean = false;
  @Input() duration: number = 0;

  @Output() visibilityChange = new EventEmitter<boolean>();
  @Output() actionClick = new EventEmitter<AlertAction>();
  @Output() dismissed = new EventEmitter<void>();

  private autoDismissTimer: any;

  get bannerClass(): string {
    const base = 'alert-banner';
    const typeClass = `alert-banner-${this.type}`;
    const dismissClass = this.dismissible ? 'alert-banner-dismissible' : '';
    return `${base} ${typeClass} ${dismissClass}`.trim();
  }

  ngOnInit(): void {
    if (this.duration > 0 && this.visible) {
      this.startAutoDismiss();
    }
  }

  onAction(action: AlertAction): void {
    this.actionClick.emit(action);
  }

  onDismiss(): void {
    this.visible = false;
    this.visibilityChange.emit(false);
    this.dismissed.emit();
  }

  private startAutoDismiss(): void {
    this.autoDismissTimer = setTimeout(() => {
      this.onDismiss();
    }, this.duration);
  }

  ngOnDestroy(): void {
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
    }
  }
}
