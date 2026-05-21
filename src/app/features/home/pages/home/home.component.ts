import { Component, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';
import { CardCanchaComponent } from 'app/features/canchas/components/card-cancha/card-cancha.component';
import { SearchCancha } from 'app/features/canchas/core/model/searchCancha.model';
import { SearchBarComponent, SearchBarData } from '@shared/components/search-bar/search-bar.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Ubigeo } from 'app/features/canchas/core/model/ubigeo/ubigeo.model';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UbigeoService } from 'app/features/canchas/core/services/ubigeo.service';
import { BaseSearchComponent } from '@base/components/base-search-component/search-base.component';
import { GetTipoDeporte } from 'app/features/cancha-tipo/core/model/getTipoDeporte.model';
import { TipoDeporteService } from 'app/features/cancha-tipo/core/services/tipo-deporte.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatChipsModule, MatDividerModule, MatToolbarModule,
    CommonModule,
    FooterComponent, NavVarComponent, CardCanchaComponent, SearchBarComponent,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule,
    FormsModule, ReactiveFormsModule, MatInputModule, MatAutocompleteModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent extends BaseSearchComponent implements OnInit, OnDestroy {

  private cityControlSub?: Subscription;

  // Variables para el buscador
  selectedCity: string = '';
  selectedDate: Date | null = null;
  selectedTime: string = '';
  idTipoDeporte: string = '';
  selectedUbigeo: Ubigeo | null = null;
  mostrarFiltros: boolean = false;

  tipoDeportes: GetTipoDeporte[] = [];
  canchasEjemplo: SearchCancha[] = [
    {
      codigo: 'CAN001',
      idCancha: 1,
      idProveedor: 1,
      idTipoSuperficie: 1,
      nombre: "Arena Vóley Pro",
      descripcion: "Cancha techada con arena especial para torneos de vóley.",
      precio: 45,
      telefonoCancha: "999888777",
      direccion: "Av. Javier Prado Este 1234, Surco, Lima",
      codigoUbigeo: "150141",
      latitud: -12.105,
      longitud: -76.963,
      capacidadJugadores: 12,
      idEstadoCancha: 1,
      tieneTecho: true,
      tieneIluminacion: true,
      pais: "Perú",
      duracionPreReserva: 15,
      porcentajeAdelanto: 30,
      calificacionPromedio: 4.8,

      tipoDeportes: [
        {
          idTipoDeporte: 1,
          codigo: 'VOL',
          nombre: "Vóley",
          icono: 'sports_volleyball'
        }
      ],

      urlImagen: "https://picsum.photos/seed/voley/400/250",

      estadoCancha: {
        idEstadoCancha: 1,
        codigo: "01",
        nombre: "Aprobado"
      },

      faboritos: [],

      ubigeo: {
        codigoUbigeo: "150141",
        departamento: "Lima",
        provincia: "Lima",
        distrito: "Surco"
      }
    },

    {
      codigo: 'CAN002',
      idCancha: 2,
      idProveedor: 2,
      idTipoSuperficie: 2,
      nombre: "Cancha Municipal",
      descripcion: "Campo de fútbol de césped natural mantenido por la municipalidad.",
      precio: 70,
      telefonoCancha: "988777666",
      direccion: "Av. La Fontana 567, La Molina, Lima",
      codigoUbigeo: "150135",
      latitud: -12.082,
      longitud: -76.935,
      capacidadJugadores: 22,
      idEstadoCancha: 5,
      tieneTecho: false,
      tieneIluminacion: true,
      pais: "Perú",
      duracionPreReserva: 20,
      porcentajeAdelanto: 50,
      calificacionPromedio: 4.1,

      tipoDeportes: [
        {
          idTipoDeporte: 2,
          codigo: 'FUT11',
          nombre: "Fútbol 11",
          icono: 'sports_soccer'
        },
        {
          idTipoDeporte: 1,
          codigo: 'VOL',
          nombre: "Vóley",
          icono: 'sports_volleyball'
        }
      ],

      urlImagen: "https://picsum.photos/seed/futbol/400/250",

      estadoCancha: {
        idEstadoCancha: 5,
        codigo: "05",
        nombre: "Mantenimiento"
      },

      faboritos: [],

      ubigeo: {
        codigoUbigeo: "150135",
        departamento: "Lima",
        provincia: "Lima",
        distrito: "La Molina"
      }
    },

    {
      codigo: 'CAN003',
      idCancha: 3,
      idProveedor: 3,
      idTipoSuperficie: 1,
      nombre: "Fútbol Club Junior",
      descripcion: "Cancha sintética para fútbol 7, ideal para partidos amistosos.",
      precio: 60,
      telefonoCancha: "977666555",
      direccion: "Av. San Luis 999, San Borja, Lima",
      codigoUbigeo: "150120",
      latitud: -12.095,
      longitud: -76.995,
      capacidadJugadores: 14,
      idEstadoCancha: 2,
      tieneTecho: false,
      tieneIluminacion: true,
      pais: "Perú",
      duracionPreReserva: 10,
      porcentajeAdelanto: 20,
      calificacionPromedio: 3.9,

      tipoDeportes: [
        {
          idTipoDeporte: 2,
          codigo: 'FUT7',
          nombre: "Fútbol 7",
          icono: 'sports_soccer'
        }
      ],

      urlImagen: "https://picsum.photos/seed/futbol7/400/250",

      estadoCancha: {
        idEstadoCancha: 2,
        codigo: "02",
        nombre: "Pendiente"
      },

      faboritos: [],

      ubigeo: {
        codigoUbigeo: "150120",
        departamento: "Lima",
        provincia: "Lima",
        distrito: "San Borja"
      }
    }
  ];
  ubigeos: Ubigeo[] = [];

  // Control para el autocomplete
  cityControl = new FormControl<Ubigeo | string>('');
  filteredUbigeos: Observable<Ubigeo[]>;

  minDate = new Date();

  constructor(
    private router: Router,
    private ubigeoService: UbigeoService,
    private TipoDeporteService: TipoDeporteService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('CANCHAS', viewContainerRef);

    this.filteredUbigeos = this.cityControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const searchValue = typeof value === 'string' ? value : '';
        return this._filterUbigeos(searchValue);
      })
    );
  }

  ngOnInit() {
    this.cityControlSub = this.cityControl.valueChanges?.subscribe(value => {
      if (typeof value === 'string') {
        this.selectedCity = value;
        this.selectedUbigeo = null;
      } else if (value && typeof value === 'object') {
        this.selectedUbigeo = value;
        this.selectedCity = `${value.distrito}, ${value.provincia}, ${value.departamento}`;
      } else {
        this.selectedCity = '';
        this.selectedUbigeo = null;
      }
    });
    this.cargarUbigeos();
    this.cargarTipoDeportes();

  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.cityControlSub?.unsubscribe();
  }

  onRegistrarCancha() {
    console.log("Registrar nueva cancha")
    // Aquí iría la navegación al formulario de registro
  }

  onAccesoOperador() {
    console.log("Acceso operador")
    // Aquí iría la navegación al panel de operador
  }

  onSearchBarSearch(searchData: SearchBarData) {
    // Actualizar variables locales
    this.selectedDate = searchData.fecha || null;
    this.selectedTime = searchData.hora || '';
    this.idTipoDeporte = searchData.idTipoDeporte || '';

    if (searchData.ciudad && typeof searchData.ciudad === 'object') {
      this.selectedUbigeo = searchData.ciudad;
    } else {
      this.selectedUbigeo = null;
    }

    this.router.navigate(['/cancha/canchas'], {
      queryParams: {
        fecha: this.selectedDate ? formatDateLocal(this.selectedDate) : null,
        hora: this.selectedTime,
        idTipoDeporte: this.idTipoDeporte,
        codigoUbigeo: this.selectedUbigeo?.codigoUbigeo
      }
    });
  }

  onSearchBarClear() {
    this.selectedCity = '';
    this.selectedDate = null;
    this.selectedTime = '';
    this.idTipoDeporte = '';
    this.selectedUbigeo = null;
    this.cityControl.setValue('');
  }

  onBuscarCanchas() {
    const searchParams = {
      fecha: this.selectedDate,
      hora: this.selectedTime,
      idTipoDeporte: this.idTipoDeporte,
      codigoUbigeo: this.selectedUbigeo?.codigoUbigeo
    };

    this.router.navigate(['/cancha/canchas'], {
      queryParams: {
        fecha: this.selectedDate ? formatDateLocal(this.selectedDate) : null,
        hora: this.selectedTime,
        idTipoDeporte: this.idTipoDeporte,
        codigoUbigeo: this.selectedUbigeo?.codigoUbigeo
      }
    });
  }

  onLimpiarBusqueda() {
    this.selectedCity = '';
    this.selectedDate = null;
    this.selectedTime = '';
    this.idTipoDeporte = '';
    this.selectedUbigeo = null;
    this.cityControl.setValue('');
  }

  private _filterUbigeos(value: string): Ubigeo[] {
    if (!value) return [];

    const searchTerms = value.toLowerCase().split(/\s|,/).filter(v => v); // ["lima"], ["lima","ate"]

    const filtered = this.ubigeos.filter(ubigeo => {
      const target = `${ubigeo.distrito} ${ubigeo.provincia} ${ubigeo.departamento}`.toLowerCase();
      return searchTerms.every(term => target.includes(term));
    });

    // Eliminar duplicados por distrito (o puedes elegir provincia si prefieres)
    const unique = new Map<string, Ubigeo>();
    filtered.forEach(ub => {
      if (!unique.has(ub.distrito.toLowerCase())) {
        unique.set(ub.distrito.toLowerCase(), ub);
      }
    });

    return Array.from(unique.values());
  }

  // Función para mostrar el valor en el autocomplete
  displayUbigeo(ubigeo: Ubigeo): string {
    return ubigeo ? `${ubigeo.distrito}, ${ubigeo.departamento}` : '';
  }

  async loadUbigeos(searchTerm: string) {
    return this.ubigeos.filter(ubigeo =>
      ubigeo.distrito.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ubigeo.provincia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ubigeo.departamento.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  onExplorarCanchas() {
    this.router.navigate(['/cancha/canchas']);
  }

  onVerMapa() {
    this.router.navigate(['/cancha/mapa']);
  }

  /**
   * Toggle mostrar/ocultar filtros
   */
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  private cargarUbigeos(): void {
    this.ubigeoService.listAll().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.ubigeos = response.data;
        }
      },
      error: (err) => this.openAlert(err),
    });
  }
  private cargarTipoDeportes(): void {
    this.TipoDeporteService.SelectCombo().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.tipoDeportes = response.data;
        }
      },
      error: (err) => this.openAlert(err),
    });
  }

}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}