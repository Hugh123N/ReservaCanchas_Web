import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ReservaClienteDto } from 'app/features/reserva/core/model/reservaCliente.model';
import { EstadoReservaCodigo } from '@shared/enums/estado-reserva.enum';
import { formatFechaLocal, formatFechaHora, calcularHorasRestantes } from '@shared/utils/date.utils';

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
      [EstadoReservaCodigo.PENDIENTE]: 'estado-pendiente',
      [EstadoReservaCodigo.CONFIRMADO]: 'estado-confirmado',
      [EstadoReservaCodigo.CANCELADO]: 'estado-cancelado',
      [EstadoReservaCodigo.EXPIRADO]: 'estado-expirado'
    };
    return estadoMap[codigoEstado] || '';
  }

  /**
   * Obtener icono según el estado
   */
  getEstadoIcon(codigoEstado: string): string {
    const iconMap: Record<string, string> = {
      [EstadoReservaCodigo.PENDIENTE]: 'schedule',
      [EstadoReservaCodigo.CONFIRMADO]: 'check_circle',
      [EstadoReservaCodigo.CANCELADO]: 'cancel',
      [EstadoReservaCodigo.EXPIRADO]: 'event_busy'
    };
    return iconMap[codigoEstado] || 'help';
  }

  /**
   * Formatear fecha
   */
  formatFecha(fecha: string): string {
    return formatFechaLocal(fecha, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatear fecha y hora
   */
  formatFechaHoraCompleta(fecha: string): string {
    return formatFechaHora(fecha);
  }

  /**
   * Calcular si está próxima a expirar
   */
  isProximaExpirar(): boolean {
    if (!this.reserva.fechaExpiracionPreReserva || !this.reserva.estaPendiente) return false;

    const horasRestantes = calcularHorasRestantes(this.reserva.fechaExpiracionPreReserva);

    return horasRestantes > 0 && horasRestantes <= 6;
  }

  /**
   * Calcular horas restantes
   */
  getHorasRestantes(): number {
    if (!this.reserva.fechaExpiracionPreReserva) return 0;

    return Math.floor(calcularHorasRestantes(this.reserva.fechaExpiracionPreReserva));
  }
}
