import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FeatureAuth } from '../../types/featureAuth';

@Component({
  selector: 'app-auth-visual-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './auth-visual-panel.component.html',
  host: {
    ngSkipHydration: 'true'
  }
})
export class AuthVisualPanelComponent {
  @Input() title: string = 'CanchaReservas';
  @Input() subtitle: string = 'La plataforma más completa para encontrar y reservar canchas';
  @Input() features: FeatureAuth[] = [];
}
