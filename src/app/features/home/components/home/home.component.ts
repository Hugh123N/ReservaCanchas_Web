import { Component, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';

import { CommonModule, DecimalPipe } from '@angular/common';
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
import { CanchaTipoService } from 'app/features/cancha-tipo/core/services/cancha-tipo.service';
import { GetTipoCancha } from 'app/features/cancha-tipo/core/model/getTipoCancha.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatChipsModule, MatDividerModule, MatToolbarModule,
    DecimalPipe, CommonModule,
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
  idTipoCancha: string = '';
  selectedUbigeo: Ubigeo | null = null;

  canchaTipos: GetTipoCancha[] = [];
  canchasEjemplo: SearchCancha[] = [
    {
      idCancha: 1,
      nombre: "Arena Vóley Pro",
      idTipoCancha: 1,
      descripcion: "Cancha techada con arena especial para torneos de vóley.",
      ubicacion: "Av. Javier Prado Este 1234",
      direccion: "Av. Javier Prado Este 1234, Surco, Lima",
      latitud: -12.105,
      longitud: -76.963,
      precioHora: 45,
      idProveedor: "prov-001",
      codigoUbigeo: "150141",
      idEstadoCancha: 1,
      calificacionPromedio: 4.8,
      tipoCancha: { idTipoCancha: 1, nombre: "Vóley" },
      imagenesCancha: [
        {
          idImagenCancha: 101,
          idCancha: 1,
          urlImagen: "https://picsum.photos/seed/voley/400/250",
          esPrincipal: true,
          activo: true
        }
      ],
      estadoCancha: { idEstadoCancha: 1, codigo: "01", nombre: "Aprobado" },
      faboritos: [],
      ubigeo: {
        codigoUbigeo: "150141",
        departamento: "Lima",
        provincia: "Lima",
        distrito: "Surco"
      },
      horariosDisponibles: ["08:00", "10:00", "12:00"]
    },
    {
      idCancha: 2,
      nombre: "Cancha Municipal",
      idTipoCancha: 2,
      descripcion: "Campo de fútbol de césped natural mantenido por la municipalidad.",
      ubicacion: "Av. La Fontana 567",
      direccion: "Av. La Fontana 567, La Molina, Lima",
      latitud: -12.082,
      longitud: -76.935,
      precioHora: 70,
      idProveedor: "prov-002",
      codigoUbigeo: "150135",
      idEstadoCancha: 5,
      calificacionPromedio: 4.1,
      tipoCancha: { idTipoCancha: 2, nombre: "Fútbol 11" },
      imagenesCancha: [
        {
          idImagenCancha: 102,
          idCancha: 2,
          urlImagen: "https://picsum.photos/seed/futbol/400/250",
          esPrincipal: true,
          activo: true
        }
      ],
      estadoCancha: { idEstadoCancha: 5, codigo: "05", nombre: "Mantenimiento" },
      faboritos: [],
      ubigeo: {
        codigoUbigeo: "150135",
        departamento: "Lima",
        provincia: "Lima",
        distrito: "La Molina"
      },
      horariosDisponibles: ["14:00", "16:00", "18:00"]
    },
    {
      idCancha: 3,
      nombre: "Fútbol Club Junior",
      idTipoCancha: 2,
      descripcion: "Cancha sintética para fútbol 7, ideal para partidos amistosos.",
      ubicacion: "Av. San Luis 999",
      direccion: "Av. San Luis 999, San Borja, Lima",
      latitud: -12.095,
      longitud: -76.995,
      precioHora: 60,
      idProveedor: "prov-003",
      codigoUbigeo: "150120",
      idEstadoCancha: 2,
      calificacionPromedio: 3.9,
      tipoCancha: { idTipoCancha: 2, nombre: "Fútbol 7" },
      imagenesCancha: [
        {
          idImagenCancha: 103,
          idCancha: 3,
          urlImagen: "https://picsum.photos/seed/futbol7/400/250",
          esPrincipal: true,
          activo: true
        }
      ],
      estadoCancha: { idEstadoCancha: 2, codigo: "02", nombre: "Pendiente" },
      faboritos: [],
      ubigeo: {
        codigoUbigeo: "150120",
        departamento: "Lima",
        provincia: "Lima",
        distrito: "San Borja"
      },
      horariosDisponibles: ["09:00", "11:00", "13:00"]
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
    private canchaTipoService: CanchaTipoService,
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
    this.cargarCanchaTipo();

  }

  override ngOnDestroy() {
    this.cityControlSub?.unsubscribe();
  }

  onReservarCancha(cancha: SearchCancha) {
    console.log("Reservar cancha:", cancha.nombre)
    // Aquí iría la lógica para reservar
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
    this.idTipoCancha = searchData.idTipoCancha || '';

    if (searchData.ciudad && typeof searchData.ciudad === 'object') {
      this.selectedUbigeo = searchData.ciudad;
    } else {
      this.selectedUbigeo = null;
    }

    // Navegar a canchas con los parámetros
    this.router.navigate(['/cancha/canchas'], {
      queryParams: {
        fecha: this.selectedDate ? formatDateLocal(this.selectedDate) : null,
        hora: this.selectedTime,
        idTipoCancha: this.idTipoCancha,
        codigoUbigeo: this.selectedUbigeo?.codigoUbigeo
      }
    });
  }

  onSearchBarClear() {
    this.selectedCity = '';
    this.selectedDate = null;
    this.selectedTime = '';
    this.idTipoCancha = '';
    this.selectedUbigeo = null;
    this.cityControl.setValue('');
  }

  onBuscarCanchas() {
    const searchParams = {
      fecha: this.selectedDate,
      hora: this.selectedTime,
      idTipoCancha: this.idTipoCancha,
      codigoUbigeo: this.selectedUbigeo?.codigoUbigeo
    };

    this.router.navigate(['/cancha/canchas'], {
      queryParams: {
        fecha: this.selectedDate ? formatDateLocal(this.selectedDate) : null,
        hora: this.selectedTime,
        idTipoCancha: this.idTipoCancha,
        codigoUbigeo: this.selectedUbigeo?.codigoUbigeo
      }
    });
  }

  onLimpiarBusqueda() {
    this.selectedCity = '';
    this.selectedDate = null;
    this.selectedTime = '';
    this.idTipoCancha = '';
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
  private cargarCanchaTipo(): void {
    this.canchaTipoService.SelectCombo().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.canchaTipos = response.data;
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