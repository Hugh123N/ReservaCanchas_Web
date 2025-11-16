import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VenueMapCardComponent } from '../../components/venue-map-card/venue-map-card.component';
import { UbicacionCancha } from '@shared/interfaces/location.interface';
import { MapboxService } from '@core/services/mapbox.service';
import { ErrorGeolocalizacion, GeolocationService } from '@core/services/geolocation.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mapas',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    VenueMapCardComponent
  ],
  templateUrl: './mapas.component.html',
  styleUrl: './mapas.component.css'
})
export class MapasComponent {
  // Signals de estado
  estaCargando = signal(true);
  estaCargandoUbicacion = signal(false);
  canchas = signal<UbicacionCancha[]>([]);
  canchasFiltradas = signal<UbicacionCancha[]>([]);
  canchaResaltadaId = signal<number | null>(null);
  consultaBusqueda = signal('');
  mensajeError = signal<string | null>(null);
  mostrarBuscarEnArea = signal(false);

  // Ubicación del usuario
  ubicacionUsuario: { lat: number; lng: number } | null = null;

  // Centro del mapa (por defecto: Lima, Perú)
  private readonly CENTRO_DEFECTO: [number, number] = [-77.0428, -12.0464];
  private readonly ZOOM_DEFECTO = 12;

  // Datos mock para pruebas
  private canchasMock: UbicacionCancha[] = [
    {
      id: 1,
      nombre: 'Complejo Deportivo La Molina',
      direccion: 'Av. La Universidad 1234',
      distrito: 'La Molina',
      provincia: 'Lima',
      coordenadas: { lat: -12.0794, lng: -76.9437 },
      precioDesde: 50,
      deportes: ['Fútbol', 'Vóley'],
      imagenUrl: 'assets/images/default-field.png',
      calificacion: 4.5,
      totalResenas: 128
    },
    {
      id: 2,
      nombre: 'Canchas San Borja Sport',
      direccion: 'Av. Aviación 2567',
      distrito: 'San Borja',
      provincia: 'Lima',
      coordenadas: { lat: -12.0887, lng: -77.0025 },
      precioDesde: 60,
      deportes: ['Fútbol', 'Básquet', 'Tenis'],
      imagenUrl: 'assets/images/default-field.png',
      calificacion: 4.8,
      totalResenas: 256
    },
    {
      id: 3,
      nombre: 'Arena Deportiva Surco',
      direccion: 'Calle Las Begonias 789',
      distrito: 'Santiago de Surco',
      provincia: 'Lima',
      coordenadas: { lat: -12.1391, lng: -76.9979 },
      precioDesde: 45,
      deportes: ['Fútbol', 'Vóley', 'Básquet'],
      imagenUrl: 'assets/images/default-field.png',
      calificacion: 4.3,
      totalResenas: 89
    },
    {
      id: 4,
      nombre: 'Club Miraflores Premium',
      direccion: 'Av. Larco 1500',
      distrito: 'Miraflores',
      provincia: 'Lima',
      coordenadas: { lat: -12.1212, lng: -77.0295 },
      precioDesde: 80,
      deportes: ['Fútbol', 'Tenis', 'Pádel'],
      imagenUrl: 'assets/images/default-field.png',
      calificacion: 4.9,
      totalResenas: 412
    },
    {
      id: 5,
      nombre: 'Losa Deportiva San Isidro',
      direccion: 'Av. Javier Prado 890',
      distrito: 'San Isidro',
      provincia: 'Lima',
      coordenadas: { lat: -12.0981, lng: -77.0324 },
      precioDesde: 55,
      deportes: ['Fútbol', 'Básquet'],
      imagenUrl: 'assets/images/default-field.png',
      calificacion: 4.6,
      totalResenas: 167
    }
  ];

  constructor(
    private mapboxService: MapboxService,
    private geolocationService: GeolocationService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Verificar si se pasaron canchas vía state de la ruta
    const navigation = this.router.getCurrentNavigation();
    const stateCanchas = navigation?.extras?.state?.['canchas'];

    if (stateCanchas && Array.isArray(stateCanchas)) {
      this.canchas.set(stateCanchas);
      this.canchasFiltradas.set(stateCanchas);
    } else {
      // Usar datos mock para pruebas
      this.canchas.set(this.canchasMock);
      this.canchasFiltradas.set(this.canchasMock);
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

  /**
   * Inicializa el mapa Mapbox
   */
  private inicializarMapa(): void {
    try {
      const centro = this.ubicacionUsuario
        ? [this.ubicacionUsuario.lng, this.ubicacionUsuario.lat] as [number, number]
        : this.CENTRO_DEFECTO;

      this.mapboxService.inicializarMapa('map-container', {
        centro,
        zoom: this.ZOOM_DEFECTO
      });

      // Agregar marcadores de canchas
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

  /**
   * Agrega marcadores de canchas al mapa
   */
  private agregarMarcadoresCanchas(): void {
    this.mapboxService.agregarMarcadoresCanchas(
      this.canchasFiltradas(),
      (cancha) => this.alClickMarcador(cancha),
      (cancha, estaPasandoMouse) => this.alPasarMouseMarcador(cancha, estaPasandoMouse)
    );
  }

  /**
   * Solicita la ubicación actual del usuario
   */
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

  /**
   * Maneja el click en una tarjeta
   */
  alClickTarjeta(cancha: UbicacionCancha): void {
    this.mapboxService.volarA(cancha.coordenadas.lat, cancha.coordenadas.lng, 15);
    this.canchaResaltadaId.set(cancha.id);
  }

  /**
   * Busca canchas en el área actual del mapa
   */
  buscarEnEstaArea(): void {
    this.mostrarBuscarEnArea.set(false);
    // En producción, esto llamaría al API backend con los límites actuales
    // Por ahora, solo oculta el botón
    console.log('Buscando en área actual del mapa...');
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

  /**
   * Limpia la búsqueda
   */
  limpiarBusqueda(): void {
    this.consultaBusqueda.set('');
    this.alCambiarBusqueda();
  }

  /**
   * Cierra la vista del mapa
   */
  cerrarMapa(): void {
    this.router.navigate(['/cancha/canchas']);
  }

  /**
   * Obtiene la distancia para una cancha
   */
  obtenerDistanciaCancha(cancha: UbicacionCancha): number | undefined {
    if (!this.ubicacionUsuario) return undefined;

    return this.geolocationService.calcularDistancia(
      this.ubicacionUsuario.lat,
      this.ubicacionUsuario.lng,
      cancha.coordenadas.lat,
      cancha.coordenadas.lng
    );
  }
}
