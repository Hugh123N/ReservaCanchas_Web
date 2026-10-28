import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild, ViewContainerRef, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EMPTY, Subject, catchError, finalize, switchMap, takeUntil, tap, timer } from 'rxjs';
import { BaseComponent } from '@base/components/base-component/base.component';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { QueryResultsModel } from '@base/models/query/query-results.model';
import { ResponsiveService } from '@core/services/responsive.service';
import { MapboxService } from '@core/services/mapbox.service';
import { GeolocationService, ErrorGeolocalizacion } from '@core/services/geolocation.service';
import { AuthService } from '@core/auth/services/auth.service';
import { UbicacionCancha } from '@shared/interfaces/location.interface';
import { UbicacionAutocompleteComponent } from '@shared/components/ubicacion-autocomplete/ubicacion-autocomplete.component';
import { crearOpcionesUbicacion, UbicacionOpcion } from '@shared/utils/ubicacion-options.utils';
import { GetTipoDeporte } from 'app/features/cancha-tipo/core/model/getTipoDeporte.model';
import { TipoDeporteService } from 'app/features/cancha-tipo/core/services/tipo-deporte.service';
import { VenueMapCardComponent } from '../../components/venue-map-card/venue-map-card.component';
import { FiltrosMapaResultado, MapaFiltrosModalComponent } from '../../components/mapa-filtros-modal/mapa-filtros-modal.component';
import { CanchaService } from '../../core/services/cancha.service';
import { UbigeoService } from '../../core/services/ubigeo.service';
import { CanchaFavoritaService } from '../../core/services/cancha-favorita.service';
import { SearchCanchaFilter } from '../../core/model/searchCanchaFilter.model';
import { SearchCancha } from '../../core/model/searchCancha.model';
import { canchasSort } from '../../helper/canchas-sort';

interface BusquedaMapa {
  params: QueryParamsModel;
  ajustarCamara: boolean;
  espera: number;
  acumular: boolean;
}

@Component({
  selector: 'app-mapa-canchas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule, MatProgressSpinnerModule,
    MatDialogModule, VenueMapCardComponent, UbicacionAutocompleteComponent],
  templateUrl: './mapa-canchas.component.html',
  styleUrl: './mapa-canchas.component.css'
})
export class MapaCanchasComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapViewport') private mapViewport!: ElementRef<HTMLElement>;
  @ViewChild('venueList') private set venueList(element: ElementRef<HTMLElement> | undefined) {
    this.listaElement = element?.nativeElement;
    this.configurarCargaAutomatica();
  }
  @ViewChild('loadMoreTrigger') private set loadMoreTrigger(element: ElementRef<HTMLElement> | undefined) {
    this.loadMoreElement = element?.nativeElement;
    this.configurarCargaAutomatica();
  }
  private readonly fb = inject(FormBuilder);
  private readonly esBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroy$ = new Subject<void>();
  private readonly busquedas$ = new Subject<BusquedaMapa>();
  private resizeObserver?: ResizeObserver;
  private focoTimer?: ReturnType<typeof setTimeout>;
  private seleccionFrame?: number;
  private movimientoUsuario = false;
  private ajustarAlInicializar = true;
  private listaElement?: HTMLElement;
  private loadMoreElement?: HTMLElement;
  private loadMoreObserver?: IntersectionObserver;
  private comprobarCargaFrame?: number;
  private paginaSolicitada = 1;
  private destruido = false;
  private readonly ultimaPaginaCompleta = signal(false);

  readonly filtrosForm = this.fb.group({
    nombre: ['', Validators.maxLength(120)],
    idTipoDeporte: [null as number | null]
  });
  readonly estaCargando = signal(true);
  readonly cargandoMas = signal(false);
  readonly errorCargaMas = signal<string | null>(null);
  readonly estaCargandoUbicacion = signal(false);
  readonly esVistaCompacta = signal(false);
  readonly canchas = signal<UbicacionCancha[]>([]);
  readonly canchaSeleccionada = signal<UbicacionCancha | null>(null);
  readonly canchaResaltadaId = signal<number | null>(null);
  readonly mensajeError = signal<string | null>(null);
  readonly errorCatalogos = signal<string | null>(null);
  readonly avisoError = computed(() => this.mensajeError() ?? this.errorCatalogos());
  readonly errorMapa = signal(false);
  readonly mostrarBuscarEnArea = signal(false);
  readonly filtroActual = signal<SearchCanchaFilter>({});
  readonly paginaActual = signal(1);
  readonly totalCanchas = signal(0);
  readonly resultadosSinCoordenadas = signal(0);
  readonly tiposDeporte = signal<GetTipoDeporte[]>([]);
  readonly ubicaciones = signal<UbicacionOpcion[]>([]);
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalCanchas() / this.tamanioPagina)));
  readonly hayMasCanchas = computed(() => !this.esVistaCompacta() && this.ultimaPaginaCompleta() && this.paginaActual() < this.totalPaginas());
  readonly zonaSeleccionada = computed(() => this.ubicaciones().find(o => o.codigo === this.filtroActual().codigoUbigeo));
  readonly deporteSeleccionado = computed(() => this.tiposDeporte().find(d => d.idTipoDeporte === this.filtroActual().idTipoDeporte));
  readonly resumenBusqueda = computed(() => {
    const filtros = this.filtroActual();
    const deporte = this.deporteSeleccionado()?.nombre ?? (filtros.idTipoDeporte ? 'Deporte seleccionado' : 'Todos los deportes');
    const zona = this.zonaSeleccionada()?.nombre ?? (filtros.codigoUbigeo ? 'Ubicación seleccionada' : filtros.area ? 'Zona visible del mapa' : 'Todas las ubicaciones');
    return `${deporte} • ${zona}`;
  });
  readonly cantidadFiltrosActivos = computed(() => {
    const f = this.filtroActual();
    return [f.nombre, f.codigoUbigeo, f.idTipoDeporte, f.fecha, f.hora, f.soloFavoritos, f.area].filter(Boolean).length;
  });
  readonly tamanioPagina = 20;
  readonly imagenDefecto = 'assets/images/default-field.png';
  ubicacionUsuario: { lat: number; lng: number } | null = null;

  constructor(
    private mapboxService: MapboxService,
    private geolocationService: GeolocationService,
    private canchaService: CanchaService,
    private ubigeoService: UbigeoService,
    private tipoDeporteService: TipoDeporteService,
    public canchaFavoritaService: CanchaFavoritaService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private responsiveService: ResponsiveService,
    private dialog: MatDialog,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) { super('CANCHAS', viewContainerRef); }

  ngOnInit(): void {
    if (!this.esBrowser) return;
    this.restaurarFiltros();
    this.configurarBusquedas();
    this.cargarCatalogos();
    this.subscriptions.push(
      this.responsiveService.observe('(max-width: 1024px)').subscribe(compacta => {
        const cambiaModo = compacta !== this.esVistaCompacta();
        this.esVistaCompacta.set(compacta);
        this.configurarCargaAutomatica();
        // La lista acumulada y el mapa paginado parten de la primera página al cambiar de modo.
        if (cambiaModo && (this.paginaActual() > 1 || this.paginaSolicitada > 1)) this.buscarCanchas();
      }),
      this.filtrosForm.controls.nombre.valueChanges.subscribe(nombre => {
        if (this.filtrosForm.controls.nombre.invalid) return;
        this.filtroActual.update(f => ({ ...f, nombre: nombre?.trim() || undefined }));
        this.buscarCanchas(350);
      }),
      this.filtrosForm.controls.idTipoDeporte.valueChanges.subscribe(id => {
        this.filtroActual.update(f => ({ ...f, idTipoDeporte: id ?? undefined }));
        this.buscarCanchas();
      })
    );
    this.buscarCanchas();
    if (this.route.snapshot.queryParamMap.get('cercanas') === 'true') this.solicitarUbicacionUsuario();
  }

  ngAfterViewInit(): void {
    if (!this.esBrowser) return;
    this.inicializarMapa();
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.mapboxService.redimensionar());
      this.resizeObserver.observe(this.mapViewport.nativeElement);
    }
  }

  override ngOnDestroy(): void {
    this.destruido = true;
    this.destroy$.next();
    this.destroy$.complete();
    this.busquedas$.complete();
    this.resizeObserver?.disconnect();
    this.loadMoreObserver?.disconnect();
    this.cancelarComprobacionCarga();
    this.cancelarSeleccionPendiente();
    this.mapboxService.destruir();
    super.ngOnDestroy();
  }

  private restaurarFiltros(): void {
    const state = this.router.getCurrentNavigation()?.extras.state ?? window.history.state;
    const raw: SearchCanchaFilter = state?.['filtros'] ?? {};
    const codigo = raw.codigoUbigeo ?? this.route.snapshot.queryParamMap.get('codigoUbigeo');
    const filtros: SearchCanchaFilter = {
      nombre: typeof raw.nombre === 'string' ? raw.nombre.trim().slice(0, 120) || undefined : undefined,
      codigoUbigeo: typeof codigo === 'string' && /^\d{4}(\d{2})?$/.test(codigo) ? codigo : undefined,
      idTipoDeporte: Number.isSafeInteger(raw.idTipoDeporte) && Number(raw.idTipoDeporte) > 0 ? raw.idTipoDeporte : undefined,
      fecha: typeof raw.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.fecha) ? raw.fecha : undefined,
      hora: typeof raw.hora === 'string' ? raw.hora : undefined
    };
    this.filtroActual.set(filtros);
    this.filtrosForm.patchValue({ nombre: filtros.nombre ?? '', idTipoDeporte: filtros.idTipoDeporte ?? null }, { emitEvent: false });
  }

  private configurarBusquedas(): void {
    this.busquedas$.pipe(
      // El switchMap exterior cancela inmediatamente la petición previa, incluso durante el debounce.
      switchMap(busqueda => {
        this.cancelarComprobacionCarga();
        this.paginaSolicitada = busqueda.params.page?.page ?? 1;
        this.estaCargando.set(!busqueda.acumular);
        this.cargandoMas.set(busqueda.acumular);
        this.mensajeError.set(null);
        this.errorCargaMas.set(null);
        if (!busqueda.acumular) {
          this.limpiarSeleccion();
          if (this.paginaSolicitada === 1) {
            this.paginaActual.set(1);
            this.ultimaPaginaCompleta.set(false);
            if (this.listaElement) this.listaElement.scrollTop = 0;
          }
        }
        let hayNuevosElementos = false;
        return timer(busqueda.espera).pipe(
          switchMap(() => this.canchaService.search(busqueda.params)),
          tap(response => {
            if (!response.isValid || !response.data || !Array.isArray(response.data.items)) {
              this.fallarBusqueda(busqueda.acumular);
              return;
            }
            hayNuevosElementos = this.mostrarResultados(response.data, busqueda) > 0;
          }),
          catchError(() => { this.fallarBusqueda(busqueda.acumular); return EMPTY; }),
          finalize(() => {
            this.estaCargando.set(false);
            this.cargandoMas.set(false);
            // Si una página no añade tarjetas, el botón permite continuar sin encadenar cargas vacías.
            if (hayNuevosElementos) this.programarComprobacionCarga();
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private buscarCanchas(espera = 0, ajustarCamara = !this.filtroActual().area,
    opciones: { pagina: number; acumular?: boolean } = { pagina: 1 }): void {
    this.busquedas$.next({
      espera, ajustarCamara, acumular: opciones.acumular ?? false,
      params: { page: { page: opciones.pagina, pageSize: this.tamanioPagina }, sort: canchasSort(), filter: { ...this.filtroActual() } }
    });
  }

  private mostrarResultados(resultados: QueryResultsModel<SearchCancha>, busqueda: BusquedaMapa): number {
    const validas = resultados.items.filter(c => Number.isSafeInteger(c.idCancha) && c.idCancha > 0 && Number.isFinite(c.latitud) && Number.isFinite(c.longitud) &&
      Math.abs(c.latitud!) <= 90 && Math.abs(c.longitud!) <= 180);
    const sinCoordenadas = resultados.items.length - validas.length;
    this.resultadosSinCoordenadas.update(total => busqueda.acumular ? total + sinCoordenadas : sinCoordenadas);
    const ubicadas: UbicacionCancha[] = validas.map(c => ({
      id: c.idCancha, nombre: c.nombre, direccion: c.direccion ?? '',
      distrito: c.ubigeo?.distrito ?? '', provincia: c.ubigeo?.provincia ?? '',
      lat: c.latitud!, lng: c.longitud!, precioDesde: c.precio ?? 0,
      deportes: c.tipoDeportes?.map(d => d.nombre) ?? [], imagenUrl: c.urlImagen || this.imagenDefecto
    }));
    const unicas = [...new Map(ubicadas.map(c => [c.id, c])).values()];
    const existentes = new Set(busqueda.acumular ? this.canchas().map(c => c.id) : []);
    const nuevas = unicas.filter(c => !existentes.has(c.id));
    this.canchas.update(actuales => busqueda.acumular ? [...actuales, ...nuevas] : nuevas);
    this.totalCanchas.set(resultados.total);
    this.paginaActual.set(busqueda.params.page?.page ?? 1);
    this.ultimaPaginaCompleta.set(resultados.items.length >= this.tamanioPagina);
    if (busqueda.acumular) {
      if (this.mapboxService.obtenerMapa()) this.agregarMarcadores(nuevas);
    } else {
      this.ajustarAlInicializar = busqueda.ajustarCamara;
      this.sincronizarMapa(busqueda.ajustarCamara);
    }
    return nuevas.length;
  }

  private fallarBusqueda(acumular: boolean): void {
    if (acumular) {
      this.errorCargaMas.set('No pudimos cargar más canchas. Puedes reintentar sin perder tu lista.');
      return;
    }
    this.mensajeError.set('No pudimos cargar las canchas. Vuelve a intentarlo.');
    this.canchas.set([]);
    this.totalCanchas.set(0);
    this.resultadosSinCoordenadas.set(0);
    this.ultimaPaginaCompleta.set(false);
    this.mapboxService.eliminarTodosMarcadoresCanchas();
  }

  private cargarCatalogos(): void {
    this.errorCatalogos.set(null);
    this.ubigeoService.listAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: r => {
        if (r.isValid && Array.isArray(r.data)) this.ubicaciones.set(crearOpcionesUbicacion(r.data));
        else this.errorCatalogos.set('No pudimos cargar las ubicaciones. Intenta nuevamente.');
      },
      error: () => this.errorCatalogos.set('No pudimos cargar las ubicaciones. Intenta nuevamente.')
    });
    this.tipoDeporteService.SelectCombo().pipe(takeUntil(this.destroy$)).subscribe({
      next: r => {
        if (r.isValid && Array.isArray(r.data)) this.tiposDeporte.set(r.data);
        else this.errorCatalogos.set('No pudimos cargar los deportes. Intenta nuevamente.');
      },
      error: () => this.errorCatalogos.set('No pudimos cargar los deportes. Intenta nuevamente.')
    });
  }

  private inicializarMapa(): void {
    try {
      const centro: [number, number] = this.ubicacionUsuario ? [this.ubicacionUsuario.lng, this.ubicacionUsuario.lat] : [-77.0428, -12.0464];
      const mapa = this.mapboxService.inicializarMapa('map-container', { centro, zoom: 12, geolocalizacion: false });
      mapa.on('movestart', event => {
        // Mapbox también informa resize como originalEvent; no representa explorar otra zona.
        const original = event.originalEvent;
        this.movimientoUsuario = !!original && /^(mouse|touch|pointer|wheel|key|click)/.test(original.type);
      });
      mapa.on('moveend', () => {
        if (this.movimientoUsuario) this.mostrarBuscarEnArea.set(true);
        this.movimientoUsuario = false;
      });
      mapa.on('click', () => this.limpiarSeleccion());
      mapa.on('error', () => { if (!mapa.isStyleLoaded()) this.errorMapa.set(true); });
      mapa.on('load', () => this.errorMapa.set(false));
      this.sincronizarMapa(this.ajustarAlInicializar);
      if (this.ubicacionUsuario) this.mapboxService.establecerUbicacionUsuario(this.ubicacionUsuario.lat, this.ubicacionUsuario.lng);
    } catch {
      this.errorMapa.set(true);
    }
  }

  private sincronizarMapa(ajustarCamara: boolean): void {
    if (!this.mapboxService.obtenerMapa()) return;
    this.mapboxService.eliminarTodosMarcadoresCanchas();
    this.agregarMarcadores(this.canchas());
    this.mapboxService.seleccionarMarcador(this.canchaSeleccionada()?.id ?? null);
    if (ajustarCamara && this.canchas().length) this.mapboxService.ajustarLimitesACanchas(this.canchas(), 60);
  }

  private agregarMarcadores(canchas: UbicacionCancha[]): void {
    if (!canchas.length) return;
    this.mapboxService.agregarMarcadoresCanchas(canchas,
      (cancha, event) => this.seleccionarDesdeMapa(cancha, event?.detail === 0),
      (cancha, hover) => this.resaltarDesdeMapa(cancha, hover)
    );
  }

  private activarSeleccion(cancha: UbicacionCancha): boolean {
    if (this.destruido || this.estaCargando()) return false;
    this.cancelarSeleccionPendiente();
    this.canchaSeleccionada.set(cancha);
    this.canchaResaltadaId.set(cancha.id);
    this.mapboxService.seleccionarMarcador(cancha.id);
    return true;
  }

  seleccionarDesdeLista(cancha: UbicacionCancha): void {
    if (!this.activarSeleccion(cancha)) return;
    this.centrarCanchaEnMapa(cancha);
  }

  seleccionarDesdeMapa(cancha: UbicacionCancha, conTeclado = false): void {
    if (!this.activarSeleccion(cancha)) return;
    this.centrarCanchaEnMapa(cancha);
    if (!this.esVistaCompacta()) {
      this.mostrarCanchaEnLista(cancha.id, conTeclado);
    } else if (conTeclado) {
      this.focoTimer = setTimeout(() => {
        this.focoTimer = undefined;
        this.mapViewport.nativeElement.querySelector<HTMLAnchorElement>('.selected-card a')?.focus();
      });
    }
  }

  private centrarCanchaEnMapa(cancha: UbicacionCancha): void {
    this.mapboxService.redimensionar();
    const zoom = Math.max(this.mapboxService.obtenerMapa()?.getZoom() ?? 13, 13);
    this.mapboxService.volarA(cancha.lat, cancha.lng, zoom, this.esVistaCompacta() ? [0, -70] : [0, 0]);
  }

  private mostrarCanchaEnLista(canchaId: number, conTeclado: boolean): void {
    // Esperar el render permite medir la tarjeta ya seleccionada sin desplazar otros contenedores.
    this.seleccionFrame = requestAnimationFrame(() => {
      this.seleccionFrame = undefined;
      if (this.destruido || this.esVistaCompacta() || this.canchaSeleccionada()?.id !== canchaId || !this.listaElement?.clientHeight) return;
      const lista = this.listaElement;
      const tarjeta = lista.querySelector<HTMLElement>(`[data-cancha-id="${canchaId}"]`);
      if (!tarjeta) return;
      const limiteLista = lista.getBoundingClientRect();
      const limiteTarjeta = tarjeta.getBoundingClientRect();
      const inicioVisible = limiteLista.top + lista.clientTop;
      const estaVisible = limiteTarjeta.top >= inicioVisible + 12 && limiteTarjeta.bottom <= inicioVisible + lista.clientHeight - 12;
      if (!estaVisible) {
        const margen = Math.max(12, (lista.clientHeight - limiteTarjeta.height) / 2);
        const destino = lista.scrollTop + limiteTarjeta.top - inicioVisible - margen;
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        lista.scrollTo({ top: Math.max(0, Math.min(destino, lista.scrollHeight - lista.clientHeight)), behavior });
      }
      if (conTeclado) tarjeta.querySelector<HTMLAnchorElement>('.details-link')?.focus({ preventScroll: true });
    });
  }

  private cancelarSeleccionPendiente(): void {
    if (this.seleccionFrame !== undefined) {
      cancelAnimationFrame(this.seleccionFrame);
      this.seleccionFrame = undefined;
    }
    if (this.focoTimer !== undefined) {
      clearTimeout(this.focoTimer);
      this.focoTimer = undefined;
    }
  }

  limpiarSeleccion(): void {
    this.cancelarSeleccionPendiente();
    this.canchaSeleccionada.set(null);
    this.canchaResaltadaId.set(null);
    this.mapboxService.seleccionarMarcador(null);
  }

  cerrarSeleccion(): void {
    const id = this.canchaSeleccionada()?.id;
    this.limpiarSeleccion();
    if (id) this.mapboxService.enfocarMarcador(id);
  }

  resaltarDesdeLista(cancha: UbicacionCancha, hover: boolean): void {
    if (this.destruido || this.estaCargando()) return;
    this.canchaResaltadaId.set(hover ? cancha.id : this.canchaSeleccionada()?.id ?? null);
    if (hover) this.mapboxService.resaltarMarcador(cancha.id);
    else this.mapboxService.quitarResaltadoMarcador(cancha.id);
  }

  resaltarDesdeMapa(cancha: UbicacionCancha, hover: boolean): void {
    if (this.destruido || this.estaCargando()) return;
    if (this.esVistaCompacta()) {
      if (hover && this.canchaSeleccionada()?.id !== cancha.id) this.activarSeleccion(cancha);
    } else {
      this.canchaResaltadaId.set(hover ? cancha.id : this.canchaSeleccionada()?.id ?? null);
    }
  }

  onCambiarUbicacion(option?: UbicacionOpcion): void {
    this.filtroActual.update(f => ({ ...f, codigoUbigeo: option?.codigo, area: undefined }));
    this.mostrarBuscarEnArea.set(false);
    this.buscarCanchas();
  }

  limpiarFiltros(): void {
    this.filtroActual.set({});
    this.filtrosForm.reset({ nombre: '', idTipoDeporte: null }, { emitEvent: false });
    this.mostrarBuscarEnArea.set(false);
    this.buscarCanchas();
  }

  cambiarPagina(pagina: number): void {
    if (!this.esVistaCompacta() || !Number.isInteger(pagina) || pagina < 1 || pagina > this.totalPaginas() || this.estaCargando()) return;
    this.buscarCanchas(0, !this.filtroActual().area, { pagina });
  }

  cargarMasCanchas(reintentar = false): void {
    if (this.destruido || !this.hayMasCanchas() || this.estaCargando() || this.cargandoMas() || (this.errorCargaMas() && !reintentar)) return;
    this.buscarCanchas(0, false, { pagina: this.paginaActual() + 1, acumular: true });
  }

  private configurarCargaAutomatica(): void {
    this.loadMoreObserver?.disconnect();
    this.loadMoreObserver = undefined;
    if (!this.esBrowser || this.destruido || this.esVistaCompacta() || !this.listaElement || !this.loadMoreElement ||
      !this.listaElement.contains(this.loadMoreElement) || typeof IntersectionObserver === 'undefined') return;
    this.loadMoreObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) this.cargarMasCanchas();
    }, { root: this.listaElement, rootMargin: '0px 0px 180px 0px', threshold: 0 });
    this.loadMoreObserver.observe(this.loadMoreElement);
  }

  private programarComprobacionCarga(): void {
    this.cancelarComprobacionCarga();
    if (!this.esBrowser || this.destruido || this.esVistaCompacta()) return;
    this.comprobarCargaFrame = requestAnimationFrame(() => {
      this.comprobarCargaFrame = undefined;
      if (!this.listaElement?.clientHeight || !this.loadMoreElement) return;
      const lista = this.listaElement.getBoundingClientRect();
      const trigger = this.loadMoreElement.getBoundingClientRect();
      if (trigger.top <= lista.bottom + 180 && trigger.bottom >= lista.top) this.cargarMasCanchas();
    });
  }

  private cancelarComprobacionCarga(): void {
    if (this.comprobarCargaFrame !== undefined) {
      cancelAnimationFrame(this.comprobarCargaFrame);
      this.comprobarCargaFrame = undefined;
    }
  }

  reintentarBusqueda(): void {
    if (this.errorCatalogos()) this.cargarCatalogos();
    this.buscarCanchas();
  }

  reintentarMapa(): void {
    this.limpiarSeleccion();
    this.mapboxService.destruir();
    this.errorMapa.set(false);
    this.inicializarMapa();
  }

  cerrarAviso(): void { this.mensajeError.set(null); this.errorCatalogos.set(null); }

  buscarEnEstaArea(): void {
    const limites = this.mapboxService.obtenerLimitesActuales();
    if (!limites) return;
    this.filtroActual.update(f => ({ ...f, codigoUbigeo: undefined, area: { ...limites } }));
    this.mostrarBuscarEnArea.set(false);
    this.buscarCanchas(0, false);
  }

  solicitarUbicacionUsuario(): void {
    if (this.estaCargandoUbicacion()) return;
    if (!this.geolocationService.esGeolocalizacionSoportada()) {
      this.mensajeError.set('Tu navegador no soporta geolocalización.'); return;
    }
    this.estaCargandoUbicacion.set(true);
    this.geolocationService.obtenerPosicionActual().pipe(takeUntil(this.destroy$),
      finalize(() => this.estaCargandoUbicacion.set(false))).subscribe({
      next: ubicacion => {
        this.ubicacionUsuario = ubicacion;
        this.mapboxService.volarA(ubicacion.lat, ubicacion.lng, 13);
        this.mapboxService.establecerUbicacionUsuario(ubicacion.lat, ubicacion.lng);
        this.mostrarBuscarEnArea.set(true);
      },
      error: (error: ErrorGeolocalizacion) => this.mensajeError.set(error.mensajeAmigable)
    });
  }

  abrirFiltrosModal(): void {
    const dialogRef = this.dialog.open<MapaFiltrosModalComponent, unknown, FiltrosMapaResultado>(MapaFiltrosModalComponent, {
      width: '480px', maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100dvh - 24px)',
      data: { tipoDeportes: this.tiposDeporte(), ubicaciones: this.ubicaciones(), filtrosActuales: this.filtroActual(),
        cantidadFavoritos: this.canchaFavoritaService.cantidadFavoritos(), isAuthenticated: this.authService.isAuthenticated() }
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(filtros => {
      if (!filtros) return;
      const userId = filtros.soloFavoritos ? this.authService.loadUserProfile()?.id : undefined;
      if (filtros.soloFavoritos && !userId) {
        this.mensajeError.set('Inicia sesión para filtrar tus favoritos.'); return;
      }
      const nombre = filtros.nombre?.trim() || undefined;
      const cambiaZona = (filtros.codigoUbigeo ?? undefined) !== this.filtroActual().codigoUbigeo;
      this.filtroActual.update(f => ({ ...(filtros.limpiarTodo ? {} : f), nombre, idTipoDeporte: filtros.idTipoDeporte ?? undefined,
        codigoUbigeo: filtros.codigoUbigeo ?? undefined, fecha: filtros.fecha || undefined,
        soloFavoritos: filtros.soloFavoritos, idUsuario: userId, area: filtros.limpiarTodo || cambiaZona ? undefined : f.area }));
      this.filtrosForm.patchValue({ nombre: nombre ?? '', idTipoDeporte: filtros.idTipoDeporte }, { emitEvent: false });
      this.buscarCanchas();
    });
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith(this.imagenDefecto)) image.src = this.imagenDefecto;
  }

  cerrarMapa(): void { this.router.navigate(['/cancha/canchas']); }
}
