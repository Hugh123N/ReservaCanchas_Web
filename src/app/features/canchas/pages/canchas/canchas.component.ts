import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';

import { FooterComponent } from '@shared/components/footer/footer.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';
import { CardCanchaComponent } from 'app/features/canchas/components/card-cancha/card-cancha.component';
import { BaseSearchComponent } from "@base/components/base-search-component/search-base.component";

import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Ubigeo } from '../../core/model/ubigeo/ubigeo.model';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { GetCancha } from '../../core/model/getCancha.model';
import { QueryParamsModel } from '@base/models/query/query-params.model';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { PageParamsModel } from '@base/models/grid/page-params.model';
import { canchasParams } from '../../helper/canchas-params';
import { canchasSort } from '../../helper/canchas-sort';
import { CanchasFilter } from '../../core/types/canchas-filter';
import { CanchaService } from '../../core/services/cancha.service';
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TypedFormGroup } from '@shared/types/types-form';
import { CommonModule } from '@angular/common';
import { CanchaEstadoService } from 'app/features/cancha-estado/core/services/cancha-estado.service';
import { GetEstadoCancha } from 'app/features/cancha-estado/core/model/getEstadoCancha.model';
import { CanchaTipoService } from 'app/features/cancha-tipo/core/services/cancha-tipo.service';
import { GetTipoCancha } from 'app/features/cancha-tipo/core/model/getTipoCancha.model';
import { UbigeoService } from '../../core/services/ubigeo.service';
import { ESTADO_CANCHA } from '@core/constants/constants.constant';


@Component({
  selector: 'app-canchas',
  imports: [FooterComponent, NavVarComponent, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatInputModule, MatIconModule, MatCardModule, CardCanchaComponent, MatAutocompleteModule, MatPaginatorModule, CommonModule],
  templateUrl: './canchas.component.html',
  styleUrl: './canchas.component.css',
  providers: [CanchaService]
})
export class CanchasComponent extends BaseSearchComponent {

  filterForm!: TypedFormGroup<CanchasFilter>;
  cityControl = new FormControl<Ubigeo | string | null>(null);

  // Data
  canchas: GetCancha[] = [];

  // States
  isLoading: boolean = false;
  isSearching: boolean = false;
  ESTADO_CANCHA = ESTADO_CANCHA;

  // Date
  minDate = new Date();

  estados: GetEstadoCancha[] = [];
  canchaTipos: GetTipoCancha[] = [];
  ubigeos: Ubigeo[] = [];

  filteredUbigeos: Observable<Ubigeo[]>;

  // Mock data
  mockCanchas: GetCancha[] = [
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
      tipoCancha: { nombre: "Vóley", idTipoCancha: 1 },
      imagenesCancha: [
        {
          idCancha: 1,
          urlImagen: "https://picsum.photos/seed/voley/400/250",
          esPrincipal: true,
          idImagenCancha: 101,
          activo: true
        }
      ],
      estadoCancha: { codigo: "01", nombre: "Aprobado", idEstadoCancha: 1 },
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
      idEstadoCancha: 1,
      calificacionPromedio: 4.1,
      tipoCancha: { nombre: "Fútbol 11", idTipoCancha: 2 },
      imagenesCancha: [
        {
          idCancha: 2,
          urlImagen: "https://picsum.photos/seed/futbol/400/250",
          esPrincipal: true,
          idImagenCancha: 102,
          activo: true
        }
      ],
      estadoCancha: { codigo: "01", nombre: "Aprobado", idEstadoCancha: 1 },
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
      idEstadoCancha: 1,
      calificacionPromedio: 3.9,
      tipoCancha: { nombre: "Fútbol 7", idTipoCancha: 2 },
      imagenesCancha: [
        {
          idCancha: 3,
          urlImagen: "https://picsum.photos/seed/futbol7/400/250",
          esPrincipal: true,
          idImagenCancha: 103,
          activo: true
        }
      ],
      estadoCancha: { codigo: "01", nombre: "Aprobado", idEstadoCancha: 1 },
      faboritos: [],
      ubigeo: {
        codigoUbigeo: "150120",
        departamento: "Lima",
        provincia: "Lima",
        distrito: "San Borja"
      },
      horariosDisponibles: ["09:00", "11:00", "13:00"]
    },
    {
      idCancha: 4,
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
      idEstadoCancha: 1,
      calificacionPromedio: 3.9,
      tipoCancha: { nombre: "Fútbol 7", idTipoCancha: 2 },
      imagenesCancha: [
        {
          idCancha: 3,
          urlImagen: "https://picsum.photos/seed/futbol7/400/250",
          esPrincipal: true,
          idImagenCancha: 103,
          activo: true
        }
      ],
      estadoCancha: { codigo: "01", nombre: "Aprobado", idEstadoCancha: 1 },
      faboritos: [],
      ubigeo: {
        codigoUbigeo: "150120",
        departamento: "Lima",
        provincia: "Lima",
        distrito: "San Borja"
      },
      horariosDisponibles: ["09:00", "11:00", "13:00"]
    },
    {
      idCancha: 5,
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
      idEstadoCancha: 1,
      calificacionPromedio: 3.9,
      tipoCancha: { nombre: "Fútbol 7", idTipoCancha: 2 },
      imagenesCancha: [
        {
          idCancha: 3,
          urlImagen: "https://picsum.photos/seed/futbol7/400/250",
          esPrincipal: true,
          idImagenCancha: 103,
          activo: true
        }
      ],
      estadoCancha: { codigo: "01", nombre: "Aprobado", idEstadoCancha: 1 },
      faboritos: [],
      ubigeo: {
        codigoUbigeo: "150120",
        departamento: "Lima",
        provincia: "Lima",
        distrito: "San Borja"
      },
      horariosDisponibles: ["09:00", "11:00", "13:00"]
    },
    {
      idCancha: 6,
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
      idEstadoCancha: 1,
      calificacionPromedio: 3.9,
      tipoCancha: { nombre: "Fútbol 7", idTipoCancha: 2 },
      imagenesCancha: [
        {
          idCancha: 3,
          urlImagen: "https://picsum.photos/seed/futbol7/400/250",
          esPrincipal: true,
          idImagenCancha: 103,
          activo: true
        }
      ],
      estadoCancha: { codigo: "01", nombre: "Aprobado", idEstadoCancha: 1 },
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

  constructor(
    private canchaService: CanchaService,
    private canchaEstadoService: CanchaEstadoService,
    private canchaTipoService: CanchaTipoService,
    private ubigeoService: UbigeoService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('CANCHAS', viewContainerRef);
    // Initialize autocomplete
    this.filteredUbigeos = this.cityControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const searchValue = typeof value === 'string' ? value : '';
        return this._filterUbigeos(searchValue);
      })
    );
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      nombre: [null],
      codigoUbigeo: [null],
      fecha: [null],
      hora: [null],
      idTipoCancha: [null],
      idEstadoCancha: [null]
    }) as TypedFormGroup<CanchasFilter>;

    this.cargarCanchaEstados();
    this.cargarCanchaTipo();
    this.cargarUbigeos();

    this.setupCityControlSync();

    this.route.queryParams.subscribe(params => {
      const fecha = params['fecha'] || null;
      const hora = params['hora'] || null;
      const idTipoCanchaParam = params['idTipoCancha'];
      const codigoUbigeo = params['codigoUbigeo'] || null;

      const fechaNormalizada = fecha ? normalizeDateString(fecha) : null;
      const idTipoCancha = idTipoCanchaParam ? Number(idTipoCanchaParam) : null;

      this.filterForm.patchValue({
        nombre: null,
        codigoUbigeo: codigoUbigeo,
        fecha: fechaNormalizada,
        hora: hora,
        idTipoCancha: idTipoCancha,
        idEstadoCancha: null
      });

      const hasFilters = fecha !== null || hora !== null || idTipoCancha !== null || codigoUbigeo !== null;

      if (hasFilters) {
        this.isSearching = true;
        this.onSearch();
      } else {
        this.isSearching = false;
        this.onSearch();
        this.loadAllCanchas();
      }
    });
  }


  override ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSearch(filter = null, page = 1) {
    const sort = canchasSort();
    const pageSize = 5;
    const filterToUse = filter || canchasParams(this.filterForm.value);
    const pageParams = new PageParamsModel(page, pageSize);

    this.updateFilter(filterToUse);
    this.updateSort(sort);
    this.updatePage(pageParams);

    const params = this.getPageParams();
    const subscription = this.canchaService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.total = response.data.total;
          this.canchas = response.data.items;
        }
        this.isLoading = false;
      },
      error: (err) => this.openAlert(err)
    });
    this.subscriptions.push(subscription);
  }

  loadAllCanchas() {
    this.isLoading = true;
    this.isSearching = false;

    // Simulación
    setTimeout(() => {
      this.canchas = [...this.mockCanchas];
      this.total = this.canchas.length + this.mockCanchas.length;
      this.isLoading = false;
    }, 500);
  }

  // Event Handlers
  onPageChange(event: PageEvent) {
    this.onSearch(this.filter, event.pageIndex + 1);
  }

  onClear() {
    this.filterForm.reset();
    this.cityControl.reset();
    this.onSearch();
  }

  onSortChange() {
    this.onSearch(this.filter, 1);
  }

  setupCityControlSync() {

    this.cityControl.valueChanges.subscribe(value => {
      let ubigeoObj: Ubigeo | null = null;
      if (typeof value === 'string') {
        this.filterForm.patchValue({ codigoUbigeo: null });
      } else if (value && typeof value === 'object') {
        ubigeoObj = value as Ubigeo;
        this.filterForm.patchValue({ codigoUbigeo: ubigeoObj.codigoUbigeo });
      }
    });
  }

  onSelectCancha(cancha: GetCancha) {
    this.router.navigate(['/cancha', cancha.idCancha]);
  }

  // UI Helper Methods
  getPageTitle(): string {
    if (this.isSearching) {
      return 'Resultados de búsqueda';
    }
    return 'Explora todas las canchas';
  }

  trackByCancha(index: number, cancha: GetCancha): number {
    return cancha.idCancha;
  }

  private _filterUbigeos(value: string): Ubigeo[] {
    const filterValue = value.toLowerCase();
    return this.ubigeos.filter(ubigeo =>
      ubigeo.distrito.toLowerCase().includes(filterValue) ||
      ubigeo.provincia.toLowerCase().includes(filterValue) ||
      ubigeo.departamento.toLowerCase().includes(filterValue)
    );
  }

  displayUbigeo(ubigeo: Ubigeo | string | null): string {
    if (!ubigeo) return '';
    return typeof ubigeo === 'string'
      ? ubigeo
      : `${ubigeo.distrito}, ${ubigeo.departamento}`;
  }
  private cargarCanchaEstados(): void {
    this.canchaEstadoService.SelectCombo().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.estados = response.data;
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
  private cargarUbigeos(): void {
    this.ubigeoService.listAll().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.ubigeos = response.data;

          const codigoUbigeo = this.route.snapshot.queryParamMap.get('codigoUbigeo');
          if (codigoUbigeo) {
            const ubigeoObj = this.ubigeos.find(u => u.codigoUbigeo === codigoUbigeo);
            if (ubigeoObj) {
              this.cityControl.setValue(ubigeoObj, { emitEvent: false });
              this.filterForm.patchValue({ codigoUbigeo }); // mantener coherencia
            }
          }
        }
      },
      error: (err) => this.openAlert(err),
    });
  }

  get fechaDate(): Date | null {
    const fechaStr = this.filterForm?.value?.fecha;
    return fechaStr ? new Date(fechaStr + 'T00:00:00') : null;
  }


}

function normalizeDateString(dateStr: string): string {
  if (!dateStr) return dateStr;
  // Convierte un string tipo '2025-10-05' interpretándolo como fecha local, no UTC
  const utcDate = new Date(dateStr);
  const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0]; // Retorna 'YYYY-MM-DD'
}
