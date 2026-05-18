import { Component, OnInit, OnDestroy, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

import { MapboxService } from '../../../../core/services/mapbox.service';
import { GeolocationService, ErrorGeolocalizacion } from '../../../../core/services/geolocation.service';
import { UbicacionCancha } from '../../../../shared/interfaces/location.interface';
import { VenueMapCardComponent } from '../../components/venue-map-card/venue-map-card.component';
import { CanchaService } from '../../core/services/cancha.service';
import { UbigeoService } from '../../core/services/ubigeo.service';
import { CanchaFavoritaService } from '../../core/services/cancha-favorita.service';
import { AuthService } from '@core/auth/services/auth.service';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { SearchCanchaFilter } from '../../core/model/searchCanchaFilter.model';
import { AreaGeografica } from '../../core/model/areaGeografica.model';
import { SearchCancha } from '../../core/model/searchCancha.model';
import { GetTipoDeporte } from '../../../cancha-tipo/core/model/getTipoDeporte.model';
import { Ubigeo } from '../../core/model/ubigeo/ubigeo.model';
import { canchasSort } from '../../helper/canchas-sort';
import { MapaFiltrosModalComponent } from '../../components/mapa-filtros-modal/mapa-filtros-modal.component';
import { TipoDeporteService } from 'app/features/cancha-tipo/core/services/tipo-deporte.service';

/**
 * Componente de página del contenedor de mapa
 * Muestra un mapa interactivo con marcadores de canchas y lista en sidebar/bottom sheet
 */
@Component({
  selector: 'app-mapa-canchas',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSlideToggleModule,
    LayoutModule,
    FormsModule,
    VenueMapCardComponent
  ],
  templateUrl: './mapa-canchas.component.html',
  styleUrl: './mapa-canchas.component.css'
})
export class MapaCanchasComponent implements OnInit, AfterViewInit, OnDestroy {
  // Signals de estado
  estaCargando = signal(true);
  estaCargandoUbicacion = signal(false);
  canchas = signal<UbicacionCancha[]>([]);
  canchasFiltradas = signal<UbicacionCancha[]>([]);
  canchaResaltadaId = signal<number | null>(null);
  consultaBusqueda = signal('');
  mensajeError = signal<string | null>(null);
  mostrarBuscarEnArea = signal(false);

  // Detección mobile
  isMobile$!: Observable<boolean>;

  // Signals para filtros y paginación
  filtroActual = signal<SearchCanchaFilter>({});
  paginaActual = signal(1);
  totalCanchas = signal(0);
  tamanioPagina = 20;
  tiposDeporte = signal<GetTipoDeporte[]>([]);
  ubigeos = signal<Ubigeo[]>([]);

  // Ubicación del usuario
  ubicacionUsuario: { lat: number; lng: number } | null = null;

  // Centro del mapa (por defecto: Lima, Perú)
  private readonly CENTRO_DEFECTO: [number, number] = [-77.0428, -12.0464];
  private readonly ZOOM_DEFECTO = 12;

  // Contador de filtros activos
  get cantidadFiltrosActivos(): number {
    let count = 0;
    const filtro = this.filtroActual();
    if (filtro.idTipoDeporte) count++;
    if (filtro.codigoUbigeo) count++;
    if (filtro.fecha) count++;
    if (filtro.soloFavoritos) count++;
    return count;
  }

  constructor(
    private mapboxService: MapboxService,
    private geolocationService: GeolocationService,
    private canchaService: CanchaService,
    private ubigeoService: UbigeoService,
    private TipoDeporteService: TipoDeporteService,
    public canchaFavoritaService: CanchaFavoritaService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog
  ) {
    // Inicializar detección mobile
    this.isMobile$ = this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  ngOnInit(): void {
    // Cargar favoritos del usuario si está autenticado
    if (this.authService.isAuthenticated()) {
      this.canchaFavoritaService.cargarFavoritosUsuario();
    }

    // Cargar tipos de deporte y ubigeos
    this.cargarTiposDeporte();
    this.cargarUbigeos();

    // Verificar si se pasaron canchas vía state de la ruta
    const navigation = this.router.getCurrentNavigation();
    const stateCanchas = navigation?.extras?.state?.['canchas'];
    const stateFiltros = navigation?.extras?.state?.['filtros'];

    if (stateCanchas && Array.isArray(stateCanchas)) {
      // Usar canchas del state
      this.canchas.set(stateCanchas);
      this.canchasFiltradas.set(stateCanchas);
      if (stateFiltros) {
        this.filtroActual.set(stateFiltros);
      }
    } else {
      // Cargar canchas iniciales del backend
      this.cargarCanchasIniciales();
    }

    // Verificar si se debe solicitar geolocalización (modo cercanas)
    const solicitarUbicacion = this.route.snapshot.queryParamMap.get('cercanas') === 'true';
    if (solicitarUbicacion) {
      this.solicitarUbicacionUsuario();
    }
  }

  ngAfterViewInit(): void {
    // Inicializar mapa después de que la vista esté lista
    setTimeout(() => {
      this.inicializarMapa();
    }, 100);
  }

  ngOnDestroy(): void {
    // Limpiar recursos del mapa
    this.mapboxService.destruir();
  }

  private inicializarMapa(): void {
    try {
      const centro = this.ubicacionUsuario
        ? [this.ubicacionUsuario.lng, this.ubicacionUsuario.lat] as [number, number]
        : this.CENTRO_DEFECTO;

      this.mapboxService.inicializarMapa('map-container', {
        centro,
        zoom: this.ZOOM_DEFECTO
      });

      // Limpiar marcadores existentes antes de agregar nuevos
      this.mapboxService.eliminarTodosMarcadoresCanchas();

      // Agregar marcadores de canchas (tanto si vienen del state como del backend)
      this.agregarMarcadoresCanchas();

      // Ajustar límites para mostrar todas las canchas
      if (this.canchasFiltradas().length > 0) {
        this.mapboxService.ajustarLimitesACanchas(this.canchasFiltradas(), 80);
      }

      // Agregar marcador de ubicación del usuario si está disponible
      if (this.ubicacionUsuario) {
        this.mapboxService.establecerUbicacionUsuario(this.ubicacionUsuario.lat, this.ubicacionUsuario.lng);
      }

      // Escuchar eventos de movimiento del mapa
      this.mapboxService.enEventoMapa('moveend', () => {
        this.mostrarBuscarEnArea.set(true);
      });

      this.estaCargando.set(false);
    } catch (error) {
      console.error('Error al inicializar mapa:', error);
      this.mensajeError.set('Error al cargar el mapa. Por favor, verifica que la configuración de Mapbox sea correcta.');
      this.estaCargando.set(false);
    }
  }

  private agregarMarcadoresCanchas(): void {
    this.mapboxService.agregarMarcadoresCanchas(
      this.canchasFiltradas(),
      (cancha) => this.alClickMarcador(cancha),
      (cancha, estaPasandoMouse) => this.alPasarMouseMarcador(cancha, estaPasandoMouse)
    );
  }

  solicitarUbicacionUsuario(): void {
    if (!this.geolocationService.esGeolocalizacionSoportada()) {
      this.mensajeError.set('Tu navegador no soporta geolocalización.');
      return;
    }

    this.estaCargandoUbicacion.set(true);
    this.mensajeError.set(null);

    this.geolocationService.obtenerPosicionActual().subscribe({
      next: (ubicacion) => {
        this.ubicacionUsuario = ubicacion;
        this.estaCargandoUbicacion.set(false);

        // Actualizar mapa
        if (this.mapboxService.obtenerMapa()) {
          this.mapboxService.volarA(ubicacion.lat, ubicacion.lng, 13);
          this.mapboxService.establecerUbicacionUsuario(ubicacion.lat, ubicacion.lng);

          // Ordenar canchas por distancia
          const canchasConDistancia = this.geolocationService.ordenarPorDistancia(
            this.canchasFiltradas(),
            ubicacion.lat,
            ubicacion.lng
          );
          this.canchasFiltradas.set(canchasConDistancia);
        }
      },
      error: (error: ErrorGeolocalizacion) => {
        this.estaCargandoUbicacion.set(false);
        this.mensajeError.set(error.mensajeAmigable);
      }
    });
  }

  /**
   * Maneja el click en un marcador
   */
  alClickMarcador(cancha: UbicacionCancha): void {
    this.router.navigate(['/cancha', cancha.id]);
  }

  /**
   * Maneja el hover en un marcador
   */
  alPasarMouseMarcador(cancha: UbicacionCancha, estaPasandoMouse: boolean): void {
    if (estaPasandoMouse) {
      this.canchaResaltadaId.set(cancha.id);
    } else {
      this.canchaResaltadaId.set(null);
    }
  }

  /**
   * Maneja el hover en una tarjeta
   */
  alPasarMouseTarjeta(cancha: UbicacionCancha, estaPasandoMouse: boolean): void {
    if (estaPasandoMouse) {
      this.canchaResaltadaId.set(cancha.id);
      this.mapboxService.resaltarMarcador(cancha.id);
    } else {
      this.canchaResaltadaId.set(null);
      this.mapboxService.quitarResaltadoMarcador(cancha.id);
    }
  }

  alClickTarjeta(cancha: UbicacionCancha): void {
    this.mapboxService.volarA(cancha.lat, cancha.lng, 15);
    this.canchaResaltadaId.set(cancha.id);
  }

  /**
   * Busca canchas en el área actual del mapa
   */
  buscarEnEstaArea(): void {
    this.mostrarBuscarEnArea.set(false);
    this.estaCargando.set(true);

    // Obtener límites actuales del mapa
    const limites = this.mapboxService.obtenerLimitesActuales();

    if (!limites) {
      this.mensajeError.set('No se pudo obtener el área del mapa.');
      this.estaCargando.set(false);
      return;
    }

    // Crear filtro con área geográfica
    const filtroConArea: SearchCanchaFilter = {
      ...this.filtroActual(),
      codigoUbigeo: undefined, // Limpiar ubicación específica
      area: {
        norte: limites.norte,
        sur: limites.sur,
        este: limites.este,
        oeste: limites.oeste
      }
    };

    this.filtroActual.set(filtroConArea);
    this.paginaActual.set(1); // Resetear a página 1

    this.buscarCanchas();
  }

  /**
   * Filtra canchas por consulta de búsqueda
   */
  alCambiarBusqueda(): void {
    const consulta = this.consultaBusqueda().toLowerCase().trim();

    if (!consulta) {
      this.canchasFiltradas.set(this.canchas());
    } else {
      const filtradas = this.canchas().filter(cancha =>
        cancha.nombre.toLowerCase().includes(consulta) ||
        cancha.distrito.toLowerCase().includes(consulta) ||
        cancha.deportes.some(d => d.toLowerCase().includes(consulta))
      );
      this.canchasFiltradas.set(filtradas);
    }

    // Actualizar marcadores del mapa
    this.mapboxService.eliminarTodosMarcadoresCanchas();
    this.agregarMarcadoresCanchas();

    // Ajustar límites a canchas filtradas
    if (this.canchasFiltradas().length > 0) {
      this.mapboxService.ajustarLimitesACanchas(this.canchasFiltradas(), 80);
    }
  }

  limpiarBusqueda(): void {
    this.consultaBusqueda.set('');
    this.alCambiarBusqueda();
  }

  cerrarMapa(): void {
    this.router.navigate(['/cancha/canchas']);
  }

  obtenerDistanciaCancha(cancha: UbicacionCancha): number | undefined {
    if (!this.ubicacionUsuario) return undefined;

    return this.geolocationService.calcularDistancia(
      this.ubicacionUsuario.lat,
      this.ubicacionUsuario.lng,
      cancha.lat,
      cancha.lng
    );
  }

  onCambiarPagina(event: PageEvent): void {
    this.paginaActual.set(event.pageIndex + 1);
    this.tamanioPagina = event.pageSize;
    this.buscarCanchas();
  }

  onCambiarFiltroTipo(idTipoCancha: number | undefined): void {
    this.filtroActual.update(f => ({ ...f, idTipoDeporte: idTipoCancha }));
    this.paginaActual.set(1);
    this.buscarCanchas();
  }

  onCambiarFiltroUbigeo(codigoUbigeo: string | undefined): void {
    this.filtroActual.update(f => ({ ...f, codigoUbigeo, area: undefined })); // Limpiar área al seleccionar ubicación
    this.paginaActual.set(1);
    this.buscarCanchas();
  }

  onCambiarFiltroFavoritos(soloFavoritos: boolean): void {
    const user = this.authService.loadUserProfile();
    if (!user?.id) {
      this.mensajeError.set('Debes iniciar sesión para ver tus favoritos');
      return;
    }

    this.filtroActual.update(f => ({
      ...f,
      soloFavoritos: soloFavoritos,
      idUsuario: soloFavoritos ? user.id : undefined,
      codigoUbigeo: soloFavoritos ? undefined : f.codigoUbigeo // Limpiar ubicación si filtra favoritos
    }));

    this.paginaActual.set(1);
    this.buscarCanchas();
  }

  private cargarCanchasIniciales(): void {
    this.estaCargando.set(true);

    const queryParams: QueryParamsModel = {
      page: { page: 1, pageSize: this.tamanioPagina },
      sort: canchasSort(),
      filter: this.filtroActual()
    };

    this.canchaService.search(queryParams).subscribe({
      next: (response) => {
        if (response.isValid && response.data) {
          const canchasUbicacion = this.convertirSearchCanchaAUbicacion(response.data.items);
          this.canchas.set(canchasUbicacion);
          this.canchasFiltradas.set(canchasUbicacion);
          this.totalCanchas.set(response.data.total);
          this.paginaActual.set(1);

          // Actualizar marcadores si el mapa ya está inicializado
          if (this.mapboxService.obtenerMapa()) {
            this.mapboxService.eliminarTodosMarcadoresCanchas();
            this.agregarMarcadoresCanchas();
            if (canchasUbicacion.length > 0) {
              this.mapboxService.ajustarLimitesACanchas(canchasUbicacion, 80);
            }
          }
        }
        this.estaCargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar canchas:', err);
        this.mensajeError.set('Error al cargar las canchas. Por favor, intenta nuevamente.');
        this.estaCargando.set(false);
      }
    });
  }

  private buscarCanchas(): void {
    const queryParams: QueryParamsModel = {
      page: {
        page: this.paginaActual(),
        pageSize: this.tamanioPagina
      },
      sort: canchasSort(),
      filter: this.filtroActual()
    };

    this.canchaService.search(queryParams).subscribe({
      next: (response) => {
        if (response.isValid && response.data) {
          const canchasUbicacion = this.convertirSearchCanchaAUbicacion(response.data.items);
          this.canchas.set(canchasUbicacion);
          this.canchasFiltradas.set(canchasUbicacion);
          this.totalCanchas.set(response.data.total);
          // Actualizar marcadores en el mapa
          this.mapboxService.eliminarTodosMarcadoresCanchas();
          this.agregarMarcadoresCanchas();
        }
        this.estaCargando.set(false);
      },
      error: (err) => {
        console.error('Error en búsqueda de canchas:', err);
        this.mensajeError.set('Error al buscar canchas. Por favor, intenta nuevamente.');
        this.estaCargando.set(false);
      }
    });
  }

  private convertirSearchCanchaAUbicacion(canchas: SearchCancha[]): UbicacionCancha[] {
    return canchas.map(c => ({
      id: c.idCancha!,
      nombre: c.nombre,
      direccion: c.direccion || '',
      distrito: c.ubigeo?.distrito || '',
      provincia: c.ubigeo?.provincia || '',
      lat: c.latitud!,
      lng: c.longitud!,
      precioDesde: c.precioHora || 0,
      deportes: c.tipoDeportes?.map(td => td.nombre) || [''],
      imagenUrl: c.imagenesCancha?.[0]?.urlImagen || 'assets/images/default-field.png',
      calificacion: c.calificacionPromedio || 0,
      totalResenas: 0
    }));
  }

  private cargarTiposDeporte(): void {
    this.TipoDeporteService.SelectCombo().subscribe({
      next: (response) => {
        if (response.isValid && response.data) {
          this.tiposDeporte.set(response.data);
        }
      },
      error: (err) => console.error('Error al cargar tipos de deporte:', err)
    });
  }

  private cargarUbigeos(): void {
    this.ubigeoService.listAll().subscribe({
      next: (response) => {
        if (response.isValid && response.data) {
          this.ubigeos.set(response.data);
        }
      },
      error: (err) => console.error('Error al cargar ubigeos:', err)
    });
  }

  /**
   * Abre el modal de filtros para mobile
   */
  abrirFiltrosModal(): void {
    const dialogRef = this.dialog.open(MapaFiltrosModalComponent, {
      width: '100%',
      maxWidth: '100vw',
      height: '100%',
      maxHeight: '100vh',
      panelClass: 'filtros-fullscreen-dialog',
      data: {
        tiposDeporte: this.tiposDeporte(),
        ubigeos: this.ubigeos(),
        cantidadFavoritos: this.canchaFavoritaService.cantidadFavoritos(),
        filtrosActuales: this.filtroActual()
      }
    });

    dialogRef.afterClosed().subscribe(filtros => {
      if (filtros) {
        const user = this.authService.loadUserProfile();

        // Aplicar filtros
        this.filtroActual.set({
          ...this.filtroActual(),
          idTipoDeporte: filtros.idTipoCancha,
          codigoUbigeo: filtros.soloFavoritos ? undefined : filtros.codigoUbigeo, // Limpiar ubicación si favoritos
          fecha: filtros.fecha,
          soloFavoritos: filtros.soloFavoritos,
          idUsuario: filtros.soloFavoritos ? user?.id : undefined
        });
        this.paginaActual.set(1);
        this.buscarCanchas();
      }
    });
  }
}
