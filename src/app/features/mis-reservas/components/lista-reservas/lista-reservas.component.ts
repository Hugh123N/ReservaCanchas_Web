import { Component, ChangeDetectionStrategy, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild, ViewContainerRef, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { EMPTY, Subject, catchError, defer, finalize, switchMap, takeUntil, tap } from 'rxjs';
import { BaseComponent } from '@base/components/base-component/base.component';
import { AuthService } from '@core/auth/services/auth.service';
import { ReservaService } from 'app/features/reserva/core/services/reserva.service';
import { ReservaClienteDto, SearchReservaClienteFilterDto } from 'app/features/reserva/core/model/reservaCliente.model';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { EstadoReservaCodigo } from '@shared/enums/estado-reserva.enum';
import { formatFechaLocal } from '@shared/utils/date.utils';
import { FiltrosReservasComponent } from '../filtros-reservas/filtros-reservas.component';
import { DetalleReservaComponent, DetalleReservaResultado } from '../detalle-reserva/detalle-reserva.component';
import { normalizarFiltrosReserva, OPCIONES_ESTADO_RESERVA, presentarReserva } from '../../helpers/reserva-presentacion.utils';

@Component({
  selector: 'app-lista-reservas', standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, CurrencyPipe, MatIconModule, MatDialogModule, FiltrosReservasComponent],
  templateUrl: './lista-reservas.component.html',
  styleUrl: './lista-reservas.component.css'
})
export class ListaReservasComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('resultsHeading') private resultsHeading?: ElementRef<HTMLElement>;
  readonly reservas = signal<ReservaClienteDto[]>([]);
  readonly reservasVista = computed(() => this.reservas().map(presentarReserva));
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly requiereSesion = signal(false);
  readonly totalItems = signal(0);
  readonly pageSize = 10;
  readonly pageIndex = signal(0);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize)));
  readonly filtrosActivos = signal<SearchReservaClienteFilterDto>({});
  readonly mostrarFiltros = signal(false);
  readonly estadosReserva = OPCIONES_ESTADO_RESERVA;
  readonly cantidadFiltros = computed(() => Object.keys(this.filtrosActivos()).length);
  readonly rangoResultados = computed(() => this.totalItems() ?
    `${this.pageIndex() * this.pageSize + 1}–${Math.min((this.pageIndex() + 1) * this.pageSize, this.totalItems())} de ${this.totalItems()}` : '0 reservas');
  readonly chipsFiltros = computed(() => {
    const f = this.filtrosActivos();
    const filtros: { key: keyof SearchReservaClienteFilterDto; label: string }[] = [];
    if (f.nombreCancha) filtros.push({ key: 'nombreCancha', label: `Cancha: ${f.nombreCancha}` });
    if (f.codigoReserva) filtros.push({ key: 'codigoReserva', label: `Código: ${f.codigoReserva}` });
    if (f.estadoPago) filtros.push({ key: 'estadoPago', label: `Pago: ${f.estadoPago}` });
    for (const key of ['fechaDesde', 'fechaHasta'] as const) {
      const fecha = f[key];
      if (fecha) filtros.push({ key, label: `${key === 'fechaDesde' ? 'Desde' : 'Hasta'} ${formatFechaLocal(`${fecha.slice(0, 10)}T12:00:00`, { day: 'numeric', month: 'short', year: 'numeric' })}` });
    }
    return filtros;
  });
  private readonly requests$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private authService: AuthService,
    private reservaService: ReservaService,
    private dialog: MatDialog,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) { super('MIS_RESERVAS', viewContainerRef); }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.requests$.pipe(
      switchMap(() => {
        this.isLoading.set(true);
        this.error.set(null);
        this.requiereSesion.set(false);
        return defer(() => {
          const user = this.authService.loadUserProfile();
          const idCliente = Number(user?.idUserNegocio);
          if (!user || !Number.isSafeInteger(idCliente) || idCliente <= 0) {
            this.requiereSesion.set(true);
            this.fallarCarga('No pudimos identificar tu sesión. Inicia sesión nuevamente.');
            return EMPTY;
          }
          const params: QueryParamsModel = {
            filter: { ...this.filtrosActivos() }, page: { page: this.pageIndex() + 1, pageSize: this.pageSize },
            sort: [{ property: 'createDate', direction: 'desc' }]
          };
          return this.reservaService.searchMisReservas(idCliente, params).pipe(tap(response => {
            if (!response.isValid || !Array.isArray(response.data?.items) || !Number.isFinite(response.data.total)) {
              this.fallarCarga(); return;
            }
            this.reservas.set(response.data.items);
            this.totalItems.set(Math.max(0, response.data.total));
          }));
        }).pipe(
          catchError(() => { this.fallarCarga(); return EMPTY; }),
          finalize(() => this.isLoading.set(false))
        );
      }), takeUntil(this.destroy$)
    ).subscribe();
    this.loadReservas();
  }

  loadReservas(): void { this.requests$.next(); }

  private fallarCarga(message = 'No pudimos cargar tus reservas. Comprueba tu conexión y vuelve a intentarlo.'): void {
    this.reservas.set([]);
    this.totalItems.set(0);
    this.error.set(message);
  }

  onPageChange(page: number): void {
    if (!Number.isInteger(page) || page < 0 || page >= this.totalPages() || page === this.pageIndex() || this.isLoading()) return;
    this.pageIndex.set(page);
    this.resultsHeading?.nativeElement.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    this.loadReservas();
  }

  seleccionarEstado(codigo?: EstadoReservaCodigo): void {
    const filtros = { ...this.filtrosActivos(), codigoEstado: codigo };
    this.aplicarFiltros(filtros);
  }

  onFiltrosChange(filtros: SearchReservaClienteFilterDto): void {
    this.mostrarFiltros.set(false);
    this.aplicarFiltros(filtros);
  }

  private aplicarFiltros(filtros: SearchReservaClienteFilterDto): void {
    this.filtrosActivos.set(normalizarFiltrosReserva(filtros));
    this.pageIndex.set(0);
    this.loadReservas();
  }

  quitarFiltro(key: keyof SearchReservaClienteFilterDto): void {
    const filtros = { ...this.filtrosActivos() };
    delete filtros[key];
    this.aplicarFiltros(filtros);
  }

  onLimpiarFiltros(): void {
    this.mostrarFiltros.set(false);
    this.aplicarFiltros({});
  }

  toggleFiltros(): void { this.mostrarFiltros.update(value => !value); }

  verDetalle(reserva: ReservaClienteDto): void {
    this.dialog.open<DetalleReservaComponent, ReservaClienteDto, DetalleReservaResultado>(DetalleReservaComponent, {
      width: '780px', maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100dvh - 24px)',
      data: reserva, panelClass: 'detalle-reserva-dialog', autoFocus: 'dialog', ariaLabelledBy: 'reservation-detail-title'
    }).afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result?.actualizar) this.loadReservas();
    });
  }

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.requests$.complete();
    super.ngOnDestroy();
  }
}
