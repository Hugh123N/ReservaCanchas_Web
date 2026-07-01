import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseComponent } from '@base/components/base-component/base.component';
import { AuthService } from '@core/auth/services/auth.service';
import { ReservaService } from 'app/features/reserva/core/services/reserva.service';
import { ReservaClienteDto, SearchReservaClienteFilterDto } from 'app/features/reserva/core/model/reservaCliente.model';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { Subject, takeUntil } from 'rxjs';
import { FiltrosReservasComponent } from '../filtros-reservas/filtros-reservas.component';
import { DetalleReservaComponent } from '../detalle-reserva/detalle-reserva.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { formatFechaLocal, calcularHorasRestantes } from '@shared/utils/date.utils';
import { EstadoReservaCodigo, getEstadoReservaMeta } from '@shared/enums/estado-reserva.enum';
import { getEstadoPagoMeta } from '@shared/enums/estado-pago.enum';

@Component({
  selector: 'app-lista-reservas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    FiltrosReservasComponent
  ],
  templateUrl: './lista-reservas.component.html',
  styleUrl: './lista-reservas.component.css'
})
export class ListaReservasComponent extends BaseComponent implements OnInit {

  reservas = signal<ReservaClienteDto[]>([]);
  isLoading = signal(false);
  totalItems = signal(0);

  pageSize = 10;
  pageIndex = 0;

  filtrosActivos: SearchReservaClienteFilterDto = {};
  mostrarFiltros = false;

  private unsubscribe = new Subject<void>();

  constructor(
    private authService: AuthService,
    private reservaService: ReservaService,
    private dialog: MatDialog,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('MIS_RESERVAS', viewContainerRef);
  }

  ngOnInit(): void {
    this.loadReservas();
  }

  loadReservas(): void {
    const user = this.authService.loadUserProfile();
    if (!user) {
      this.openWarningAlert('No se pudo obtener el usuario autenticado');
      return;
    }

    this.isLoading.set(true);

    const queryParams: QueryParamsModel = {
      filter: this.filtrosActivos,
      page: {
        page: this.pageIndex + 1,
        pageSize: this.pageSize
      },
      sort: [
        {
          property: 'createDate',
          direction: 'desc'
        }
      ]
    };

    this.reservaService
      .searchMisReservas(user.id, queryParams)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (response) => {
          if (response.isValid && response.data) {
            this.reservas.set(response.data.items);
            this.totalItems.set(response.data.total);
          } else {
            this.openErrorAlert(response || 'Error al cargar las reservas');
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.openErrorAlert(error || 'Error al cargar las reservas');
          this.isLoading.set(false);
        }
      });
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadReservas();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems() / this.pageSize);
  }

  onFiltrosChange(filtros: SearchReservaClienteFilterDto): void {
    this.filtrosActivos = filtros;
    this.pageIndex = 0;
    this.loadReservas();
  }

  onLimpiarFiltros(): void {
    this.filtrosActivos = {};
    this.pageIndex = 0;
    this.loadReservas();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  verDetalle(reserva: ReservaClienteDto): void {
    this.dialog.open(DetalleReservaComponent, {
      width: '700px',
      maxWidth: '95vw',
      minHeight: '900px',
      maxHeight: '95vh',
      data: reserva,
      panelClass: 'detalle-reserva-dialog'
    });
  }

  getEstadoReserva(codigoEstado: string) {
    return getEstadoReservaMeta(codigoEstado);
  }

  getEstadoPago(estadoPago: string) {
    return getEstadoPagoMeta(estadoPago);
  }

  formatFecha(fecha: string): string {
    return formatFechaLocal(fecha);
  }

  formatHorarios(reserva: ReservaClienteDto): string {
    if (!reserva.horarios || reserva.horarios.length === 0) return '-';

    const horarios = reserva.horarios.map(h => {
      const inicio = h.horaInicio.substring(0, 5);
      const fin = h.horaFin.substring(0, 5);
      return `${inicio}-${fin}`;
    });

    return horarios.join(', ');
  }

  isProximaExpirar(reserva: ReservaClienteDto): boolean {
    if (!reserva.fechaExpiracionPreReserva || !reserva.estaPendiente) return false;
    const horasRestantes = calcularHorasRestantes(reserva.fechaExpiracionPreReserva);
    return horasRestantes > 0 && horasRestantes <= 6;
  }

  getHorasRestantes(reserva: ReservaClienteDto): number {
    if (!reserva.fechaExpiracionPreReserva) return 0;
    return Math.floor(calcularHorasRestantes(reserva.fechaExpiracionPreReserva));
  }

  hasFiltros(): boolean {
    return this.filtrosActivos && Object.keys(this.filtrosActivos).length > 0;
  }

  override ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    super.ngOnDestroy();
  }
}
