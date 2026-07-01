import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReservaClienteDto } from 'app/features/reserva/core/model/reservaCliente.model';
import { formatFechaLocal, formatFechaHora, calcularHorasRestantes } from '@shared/utils/date.utils';
import { getEstadoReservaMeta } from '@shared/enums/estado-reserva.enum';
import { getEstadoPagoMeta } from '@shared/enums/estado-pago.enum';

@Component({
  selector: 'app-detalle-reserva',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './detalle-reserva.component.html',
  styleUrl: './detalle-reserva.component.css'
})
export class DetalleReservaComponent {

  dialogRef = inject(MatDialogRef<DetalleReservaComponent>);
  reserva = inject<ReservaClienteDto>(MAT_DIALOG_DATA);

  onClose(): void {
    this.dialogRef.close();
  }

  getEstadoReserva(codigoEstado: string) {
    return getEstadoReservaMeta(codigoEstado);
  }

  getEstadoPago(estadoPago: string) {
    return getEstadoPagoMeta(estadoPago);
  }

  formatFecha(fecha: string): string {
    return formatFechaLocal(fecha, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatFechaHoraCompleta(fecha: string): string {
    return formatFechaHora(fecha);
  }

  isProximaExpirar(): boolean {
    if (!this.reserva.fechaExpiracionPreReserva || !this.reserva.estaPendiente) return false;
    const horasRestantes = calcularHorasRestantes(this.reserva.fechaExpiracionPreReserva);
    return horasRestantes > 0 && horasRestantes <= 6;
  }

  getHorasRestantes(): number {
    if (!this.reserva.fechaExpiracionPreReserva) return 0;
    return Math.floor(calcularHorasRestantes(this.reserva.fechaExpiracionPreReserva));
  }
}
