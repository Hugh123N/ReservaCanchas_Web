import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page500',
  standalone: true,
  imports: [CommonModule,
    MatIconModule,
    MatProgressSpinnerModule],
  templateUrl: './page500.component.html'
})
export class Page500Component {
  isReconnecting = false;
  lastCheck = new Date();
  errorId = this.generateErrorId();
  errorTime = new Date();
  
  constructor(private router: Router) {}

  retryConnection(): void {
    this.isReconnecting = true;
    
    // Simular reintento de conexión
    setTimeout(() => {
      this.isReconnecting = false;
      this.lastCheck = new Date();
      
      // Aquí podrías hacer una verificación real del servidor
      // Por ahora solo actualizamos el estado
    }, 3000);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  reportError(): void {
    // Aquí podrías implementar un sistema de reporte de errores
    // Por ejemplo, abrir un modal o navegar a una página de contacto
    alert(`Error reportado.\nID: ${this.errorId}\nTiempo: ${this.errorTime.toLocaleString()}`);
  }

  private generateErrorId(): string {
    return 'ERR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}
