import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
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
import { EstadoReservaCodigo } from '@shared/enums/estado-reserva.enum';

@Component({
  selector: 'app-lista-reservas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    FiltrosReservasComponent
  ],
  templateUrl: './lista-reservas.component.html',
  styleUrl: './lista-reservas.component.css'
})
export class ListaReservasComponent extends BaseComponent implements OnInit {

  reservas: ReservaClienteDto[] = [];
  isLoading: boolean = false;

  // Paginación
  pageSize: number = 10;
  pageIndex: number = 0;
  totalItems: number = 0;
  Math = Math;

  // Filtros
  filtrosActivos: SearchReservaClienteFilterDto = {};
  mostrarFiltros: boolean = false;

  // Helpers para template
  Object = Object;

  // Subject para unsubscribe
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

  /**
   * Cargar reservas con filtros y paginación
   */
  loadReservas(): void {
    const user = this.authService.loadUserProfile();
    if (!user) {
      this.openWarningAlert('No se pudo obtener el usuario autenticado');
      return;
    }

    this.isLoading = true;

    const queryParams: QueryParamsModel = {
      filter: this.filtrosActivos,
      page: {
        page: this.pageIndex + 1, // Backend usa base 1
        pageSize: this.pageSize
      },
      sort: [
        {
          property: 'fecha',
          direction: 'desc' // Más recientes primero
        }
      ]
    };

    const subscription = this.reservaService
      .searchMisReservas(user.id, queryParams)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (response) => {
          if (response.isValid && response.data) {
            this.reservas = response.data.items;
            this.totalItems = response.data.total;
          } else {
            this.openErrorAlert(response || 'Error al cargar las reservas');
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.openErrorAlert(error || 'Error al cargar las reservas');
          this.isLoading = false;
        }
      });

    this.subscriptions.push(subscription);
  }

  /**
   * Cambio de página
   */
  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadReservas();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  /**
   * Aplicar filtros
   */
  onFiltrosChange(filtros: SearchReservaClienteFilterDto): void {
    this.filtrosActivos = filtros;
    this.pageIndex = 0; // Reset a la primera página
    this.loadReservas();
  }

  /**
   * Limpiar filtros
   */
  onLimpiarFiltros(): void {
    this.filtrosActivos = {};
    this.pageIndex = 0;
    this.loadReservas();
  }

  /**
   * Toggle mostrar/ocultar filtros
   */
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  /**
   * Ver detalle de reserva en modal
   */
  verDetalle(reserva: ReservaClienteDto): void {
    this.dialog.open(DetalleReservaComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: reserva,
      panelClass: 'detalle-reserva-dialog'//,
      //autoFocus: false
    });
  }

  /**
   * Obtener clase CSS según el estado
   */
  getEstadoClass(codigoEstado: string): string {
    const estadoMap: Record<string, string> = {
      [EstadoReservaCodigo.PENDIENTE]: 'estado-pendiente',    // Amarillo
      [EstadoReservaCodigo.CONFIRMADO]: 'estado-confirmado',   // Verde
      [EstadoReservaCodigo.CANCELADO]: 'estado-cancelado',    // Rojo
      [EstadoReservaCodigo.EXPIRADO]: 'estado-expirado'      // Gris
    };
    return estadoMap[codigoEstado] || '';
  }

  /**
   * Obtener icono según el estado
   */
  getEstadoIcon(codigoEstado: string): string {
    const iconMap: Record<string, string> = {
      [EstadoReservaCodigo.PENDIENTE]: 'schedule',           // Pendiente
      [EstadoReservaCodigo.CONFIRMADO]: 'check_circle',       // Confirmado
      [EstadoReservaCodigo.CANCELADO]: 'cancel',             // Cancelado
      [EstadoReservaCodigo.EXPIRADO]: 'event_busy'          // Expirado
    };
    return iconMap[codigoEstado] || 'help';
  }

  /**
   * Formatear fecha
   */
  formatFecha(fecha: string): string {
    return formatFechaLocal(fecha);
  }

  /**
   * Formatear horarios
   */
  formatHorarios(reserva: ReservaClienteDto): string {
    if (!reserva.horarios || reserva.horarios.length === 0) return '-';

    const horarios = reserva.horarios.map(h => {
      const inicio = h.horaInicio.substring(0, 5); // HH:mm
      const fin = h.horaFin.substring(0, 5);
      return `${inicio}-${fin}`;
    });

    return horarios.join(', ');
  }

  /**
   * Calcular si la reserva está próxima a expirar (menos de 6 horas)
   */
  isProximaExpirar(reserva: ReservaClienteDto): boolean {
    if (!reserva.fechaExpiracionPreReserva || !reserva.estaPendiente) return false;

    const horasRestantes = calcularHorasRestantes(reserva.fechaExpiracionPreReserva);

    return horasRestantes > 0 && horasRestantes <= 6;
  }

  /**
   * Calcular horas restantes para expiración
   */
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
