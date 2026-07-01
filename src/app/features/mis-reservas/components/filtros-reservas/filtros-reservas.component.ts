import { Component, ChangeDetectionStrategy, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SearchReservaClienteFilterDto } from 'app/features/reserva/core/model/reservaCliente.model';
import { EstadoReservaCodigo, EstadoReservaNombre } from '@shared/enums/estado-reserva.enum';
import { EstadoPago } from '@shared/enums/estado-pago.enum';

@Component({
  selector: 'app-filtros-reservas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './filtros-reservas.component.html',
  styleUrl: './filtros-reservas.component.css'
})
export class FiltrosReservasComponent {

  private fb = inject(FormBuilder);

  filtrosActivos = input<SearchReservaClienteFilterDto>({});
  filtrosChange = output<SearchReservaClienteFilterDto>();
  limpiarFiltros = output<void>();

  filtrosForm: FormGroup;

  estadosReserva = [
    { value: EstadoReservaCodigo.PENDIENTE, label: EstadoReservaNombre.PENDIENTE },
    { value: EstadoReservaCodigo.CONFIRMADO, label: EstadoReservaNombre.CONFIRMADO },
    { value: EstadoReservaCodigo.CANCELADO, label: EstadoReservaNombre.CANCELADO },
    { value: EstadoReservaCodigo.EXPIRADO, label: EstadoReservaNombre.EXPIRADO }
  ];

  estadosPago = [
    { value: EstadoPago.PENDIENTE, label: EstadoPago.PENDIENTE },
    { value: EstadoPago.PARCIAL, label: EstadoPago.PARCIAL },
    { value: EstadoPago.PAGADO, label: EstadoPago.PAGADO }
  ];

  constructor() {
    this.filtrosForm = this.fb.group({
      codigoEstado: [''],
      estadoPago: [''],
      fechaDesde: [''],
      fechaHasta: [''],
      codigoReserva: [''],
      nombreCancha: ['']
    });

    effect(() => {
      const filters = this.filtrosActivos();
      if (filters && Object.keys(filters).length > 0) {
        this.filtrosForm.patchValue({
          codigoEstado: filters.codigoEstado || '',
          estadoPago: filters.estadoPago || '',
          fechaDesde: filters.fechaDesde ? filters.fechaDesde.substring(0, 10) : '',
          fechaHasta: filters.fechaHasta ? filters.fechaHasta.substring(0, 10) : '',
          codigoReserva: filters.codigoReserva || '',
          nombreCancha: filters.nombreCancha || ''
        });
      }
    });
  }

  onAplicarFiltros(): void {
    const formValue = this.filtrosForm.value;

    const filtros: SearchReservaClienteFilterDto = {
      codigoEstado: formValue.codigoEstado || undefined,
      estadoPago: formValue.estadoPago || undefined,
      fechaDesde: formValue.fechaDesde ? new Date(formValue.fechaDesde).toISOString() : undefined,
      fechaHasta: formValue.fechaHasta ? new Date(formValue.fechaHasta).toISOString() : undefined,
      codigoReserva: formValue.codigoReserva?.trim() || undefined,
      nombreCancha: formValue.nombreCancha?.trim() || undefined
    };

    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof SearchReservaClienteFilterDto] === undefined) {
        delete filtros[key as keyof SearchReservaClienteFilterDto];
      }
    });

    this.filtrosChange.emit(filtros);
  }

  onLimpiar(): void {
    this.filtrosForm.reset();
    this.limpiarFiltros.emit();
  }

  hasFiltrosActivos(): boolean {
    const values = this.filtrosForm.value;
    return Object.values(values).some(v => v !== null && v !== '' && v !== undefined);
  }
}
