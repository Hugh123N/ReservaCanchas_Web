import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ReservaClienteDto } from 'app/features/reserva/core/model/reservaCliente.model';

@Component({
  selector: 'app-detalle-reserva',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './detalle-reserva.component.html',
  styleUrl: './detalle-reserva.component.css'
})
export class DetalleReservaComponent {

  constructor(
    public dialogRef: MatDialogRef<DetalleReservaComponent>,
    @Inject(MAT_DIALOG_DATA) public reserva: ReservaClienteDto
  ) {}

  /**
   * Cerrar modal
   */
  onClose(): void {
    this.dialogRef.close();
  }

  /**
   * Obtener clase CSS según el estado
   */
  getEstadoClass(codigoEstado: string): string {
    const estadoMap: Record<string, string> = {
      '01': 'estado-pendiente',
      '02': 'estado-confirmado',
      '03': 'estado-cancelado',
      '04': 'estado-expirado'
    };
    return estadoMap[codigoEstado] || '';
  }

  /**
   * Obtener icono según el estado
   */
  getEstadoIcon(codigoEstado: string): string {
    const iconMap: Record<string, string> = {
      '01': 'schedule',
      '02': 'check_circle',
      '03': 'cancel',
      '04': 'event_busy'
    };
    return iconMap[codigoEstado] || 'help';
  }

  /**
   * Formatear fecha
   */
  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('es-PE', options);
  }

  /**
   * Formatear fecha y hora
   */
  formatFechaHora(fecha: string): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-PE', options);
  }

  /**
   * Calcular si está próxima a expirar
   */
  isProximaExpirar(): boolean {
    if (!this.reserva.fechaExpiracionPreReserva || !this.reserva.estaPendiente) return false;

    const now = new Date().getTime();
    const expiracion = new Date(this.reserva.fechaExpiracionPreReserva).getTime();
    const horasRestantes = (expiracion - now) / (1000 * 60 * 60);

    return horasRestantes > 0 && horasRestantes <= 6;
  }

  /**
   * Calcular horas restantes
   */
  getHorasRestantes(): number {
    if (!this.reserva.fechaExpiracionPreReserva) return 0;

    const now = new Date().getTime();
    const expiracion = new Date(this.reserva.fechaExpiracionPreReserva).getTime();
    const horasRestantes = Math.max(0, (expiracion - now) / (1000 * 60 * 60));

    return Math.floor(horasRestantes);
  }
}
