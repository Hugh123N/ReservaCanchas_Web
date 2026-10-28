import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ReservaClienteDto } from 'app/features/reserva/core/model/reservaCliente.model';
import { presentarReserva } from '../../helpers/reserva-presentacion.utils';

export interface DetalleReservaResultado { actualizar?: boolean; }

@Component({
  selector: 'app-detalle-reserva', standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, MatDialogModule, MatIconModule],
  templateUrl: './detalle-reserva.component.html',
  styleUrl: './detalle-reserva.component.css'
})
export class DetalleReservaComponent {
  private readonly dialogRef = inject(MatDialogRef<DetalleReservaComponent, DetalleReservaResultado>);
  readonly reserva = inject<ReservaClienteDto>(MAT_DIALOG_DATA);
  readonly vista = presentarReserva(this.reserva);

  onClose(): void { this.dialogRef.close(); }
  actualizarEstado(): void { this.dialogRef.close({ actualizar: true }); }
}
