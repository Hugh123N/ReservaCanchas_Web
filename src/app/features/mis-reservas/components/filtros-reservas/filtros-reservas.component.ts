import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SearchReservaClienteFilterDto } from 'app/features/reserva/core/model/reservaCliente.model';
import { EstadoReservaCodigo, EstadoReservaNombre } from '@shared/enums/estado-reserva.enum';
import { EstadoPago } from '@shared/enums/estado-pago.enum';

@Component({
  selector: 'app-filtros-reservas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './filtros-reservas.component.html',
  styleUrl: './filtros-reservas.component.css'
})
export class FiltrosReservasComponent implements OnInit {

  @Input() filtrosActivos: SearchReservaClienteFilterDto = {};
  @Output() filtrosChange = new EventEmitter<SearchReservaClienteFilterDto>();
  @Output() limpiarFiltros = new EventEmitter<void>();

  filtrosForm!: FormGroup;

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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.filtrosForm = this.fb.group({
      codigoEstado: [this.filtrosActivos.codigoEstado || null],
      estadoPago: [this.filtrosActivos.estadoPago || null],
      fechaDesde: [this.filtrosActivos.fechaDesde ? new Date(this.filtrosActivos.fechaDesde) : null],
      fechaHasta: [this.filtrosActivos.fechaHasta ? new Date(this.filtrosActivos.fechaHasta) : null],
      codigoReserva: [this.filtrosActivos.codigoReserva || ''],
      nombreCancha: [this.filtrosActivos.nombreCancha || '']
    });
  }

  /**
   * Aplicar filtros
   */
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

    // Eliminar propiedades undefined
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof SearchReservaClienteFilterDto] === undefined) {
        delete filtros[key as keyof SearchReservaClienteFilterDto];
      }
    });

    this.filtrosChange.emit(filtros);
  }

  /**
   * Limpiar todos los filtros
   */
  onLimpiar(): void {
    this.filtrosForm.reset();
    this.limpiarFiltros.emit();
  }

  /**
   * Verificar si hay filtros activos
   */
  hasFiltrosActivos(): boolean {
    const values = this.filtrosForm.value;
    return Object.values(values).some(v => v !== null && v !== '' && v !== undefined);
  }
}
