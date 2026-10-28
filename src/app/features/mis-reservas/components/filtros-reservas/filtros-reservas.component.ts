import { Component, ChangeDetectionStrategy, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FormErrorComponent } from '@shared/components/form-error/form-error.component';
import { validateForm } from '@shared/utils/form.utils';
import { EstadoPago } from '@shared/enums/estado-pago.enum';
import { SearchReservaClienteFilterDto } from 'app/features/reserva/core/model/reservaCliente.model';
import { normalizarFiltrosReserva, OPCIONES_ESTADO_RESERVA } from '../../helpers/reserva-presentacion.utils';

const rangoFechasValidator: ValidatorFn = control => {
  const desde: string = control.get('fechaDesde')?.value;
  const hasta: string = control.get('fechaHasta')?.value;
  return desde && hasta && desde > hasta ? { invalidDate: true } : null;
};

@Component({
  selector: 'app-filtros-reservas', standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule, FormErrorComponent],
  templateUrl: './filtros-reservas.component.html',
  styleUrl: './filtros-reservas.component.css'
})
export class FiltrosReservasComponent {
  readonly filtrosActivos = input<SearchReservaClienteFilterDto>({});
  readonly filtrosChange = output<SearchReservaClienteFilterDto>();
  readonly limpiarFiltros = output<void>();
  readonly estadosReserva = OPCIONES_ESTADO_RESERVA;
  readonly estadosPago = Object.values(EstadoPago);
  readonly filtrosForm = inject(FormBuilder).nonNullable.group({
    nombreCancha: ['', Validators.maxLength(120)],
    codigoReserva: ['', Validators.maxLength(60)],
    codigoEstado: [''], estadoPago: [''], fechaDesde: [''], fechaHasta: ['']
  }, { validators: rangoFechasValidator });

  constructor() {
    effect(() => {
      const filtros = this.filtrosActivos();
      this.filtrosForm.reset({
        codigoEstado: filtros.codigoEstado ?? '', estadoPago: filtros.estadoPago ?? '',
        fechaDesde: filtros.fechaDesde?.substring(0, 10) ?? '', fechaHasta: filtros.fechaHasta?.substring(0, 10) ?? '',
        codigoReserva: filtros.codigoReserva ?? '', nombreCancha: filtros.nombreCancha ?? ''
      }, { emitEvent: false });
    });
  }

  onAplicarFiltros(): void {
    if (!validateForm(this.filtrosForm)) return;
    const value = this.filtrosForm.getRawValue();
    this.filtrosChange.emit(normalizarFiltrosReserva({
      ...value,
      fechaDesde: value.fechaDesde ? new Date(value.fechaDesde).toISOString() : undefined,
      fechaHasta: value.fechaHasta ? new Date(value.fechaHasta).toISOString() : undefined
    }));
  }

  onLimpiar(): void {
    this.filtrosForm.reset();
    this.limpiarFiltros.emit();
  }
}
