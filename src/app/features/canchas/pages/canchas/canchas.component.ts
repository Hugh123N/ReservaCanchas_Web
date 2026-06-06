import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';

import { FooterComponent } from '@shared/components/footer/footer.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';
import { CardCanchaComponent } from 'app/features/canchas/components/card-cancha/card-cancha.component';
import { BaseSearchComponent } from "@base/components/base-search-component/search-base.component";
import { SearchBarComponent, SearchBarData } from '@shared/components/search-bar/search-bar.component';

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
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { TypedFormGroup } from '@shared/types/types-form';
import { CommonModule } from '@angular/common';
import { CanchaEstadoService } from 'app/features/cancha-estado/core/services/cancha-estado.service';
import { GetEstadoCancha } from 'app/features/cancha-estado/core/model/getEstadoCancha.model';
import { GetTipoDeporte } from 'app/features/cancha-tipo/core/model/getTipoDeporte.model';
import { UbigeoService } from '../../core/services/ubigeo.service';
import { UbicacionCancha } from '@shared/interfaces/location.interface';
import { MatButtonModule } from '@angular/material/button';
import { TipoDeporteService } from 'app/features/cancha-tipo/core/services/tipo-deporte.service';
import { SearchCancha } from '../../core/model/searchCancha.model';


@Component({
  selector: 'app-canchas',
  imports: [FooterComponent, NavVarComponent, SearchBarComponent, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatInputModule, MatIconModule, MatCardModule, CardCanchaComponent, MatAutocompleteModule, MatPaginatorModule, CommonModule, MatButtonToggleModule, MatButtonModule],
  templateUrl: './canchas.component.html',
  styleUrl: './canchas.component.css',
  providers: [CanchaService]
})
export class CanchasComponent extends BaseSearchComponent {

  filterForm!: TypedFormGroup<CanchasFilter>;
  cityControl = new FormControl<Ubigeo | string | null>(null);

  // Data
  canchas: SearchCancha[] = [];

  // States
  isLoading: boolean = false;
  isSearching: boolean = false;
  vistaActual: 'lista' | 'mapa' = 'lista';
  mostrarFiltros: boolean = false;

  // Date
  minDate = new Date();

  estados: GetEstadoCancha[] = [];
  tipoDeportes: GetTipoDeporte[] = [];
  ubigeos: Ubigeo[] = [];

  filteredUbigeos: Observable<Ubigeo[]>;

  // Initial values to pass to search-bar (populated from query params + loaded data)
  initialSearchData: SearchBarData | null = null;

  constructor(
    private canchaService: CanchaService,
    private canchaEstadoService: CanchaEstadoService,
    private tipoDeporteService: TipoDeporteService,
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
      idTipoDeporte: [null],
      idEstadoCancha: [null]
    }) as TypedFormGroup<CanchasFilter>;

    this.cargarCanchaEstados();
    this.cargarTipoDeporte();
    this.cargarUbigeos();

    this.setupCityControlSync();

    this.route.queryParams.subscribe(params => {
      const fecha = params['fecha'] || null;
      const hora = params['hora'] || null;
      const idTipoDeporteParam = params['idTipoDeporte'] || null;
      const codigoUbigeo = params['codigoUbigeo'] || null;

      const fechaNormalizada = fecha ? normalizeDateString(fecha) : null;
      const idTipoDeporte = idTipoDeporteParam ? Number(idTipoDeporteParam) : null;

      this.filterForm.patchValue({
        nombre: null,
        codigoUbigeo: codigoUbigeo,
        fecha: fechaNormalizada,
        hora: hora,
        idTipoDeporte: idTipoDeporte,
        idEstadoCancha: null
      });

      const hasFilters = fecha !== null || hora !== null || idTipoDeporte !== null || codigoUbigeo !== null;

      if (hasFilters) {
        this.isSearching = true;
        this.onSearch();
      } else {
        this.isSearching = false;
        this.onSearch();
      }

      // Pre-populate search-bar initial data
      this._buildInitialSearchData({
        codigoUbigeo,
        idTipoDeporte: idTipoDeporteParam,
        fecha,
        hora
      });
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

  // Event Handlers
  onPageChange(event: PageEvent) {
    this.onSearch(this.filter, event.pageIndex + 1);
  }

  onSearchBarSearch(searchData: SearchBarData) {
    // Actualizar el filterForm con los datos del SearchBar
    this.cityControl.setValue(searchData.ciudad || null);

    // Convertir fecha a string si existe
    const fechaStr = searchData.fecha ? formatDateLocal(searchData.fecha) : null;
    // Convertir idTipoDeporte a number si existe
    const idTipoDeporteNum = searchData.idTipoDeporte ? parseInt(searchData.idTipoDeporte) : null;

    this.filterForm.patchValue({
      idTipoDeporte: idTipoDeporteNum,
      fecha: fechaStr,
      hora: searchData.hora || ''
    });
    this.onSearch();
  }

  onSearchBarClear() {
    this.filterForm.reset();
    this.cityControl.reset();
    this.onSearch();
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

  onSelectCancha(cancha: SearchCancha) {
    this.router.navigate(['/cancha', cancha.idCancha]);
  }

  trackByCancha(index: number, cancha: SearchCancha): number {
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
  private cargarTipoDeporte(): void {
    this.tipoDeporteService.SelectCombo().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.tipoDeportes = response.data;
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
              this.filterForm.patchValue({ codigoUbigeo });
              this.initialSearchData = {
                ...this.initialSearchData,
                ciudad: ubigeoObj
              };
            }
          }
        }
      },
      error: (err) => this.openAlert(err),
    });
  }

  private _buildInitialSearchData(raw: { codigoUbigeo: string | null; idTipoDeporte: string | null; fecha: string | null; hora: string | null }): void {
    this.initialSearchData = {
      ciudad: null,
      idTipoDeporte: raw.idTipoDeporte ?? undefined,
      fecha: raw.fecha ? new Date(raw.fecha + 'T00:00:00') : null,
      hora: raw.hora ?? undefined
    };
  }

  get fechaDate(): Date | null {
    const fechaStr = this.filterForm?.value?.fecha;
    return fechaStr ? new Date(fechaStr + 'T00:00:00') : null;
  }

  onCambiarVista(event: MatButtonToggleChange): void {
    if (event.value === 'mapa') {
      this.router.navigate(['/cancha/mapa'], {
        state: {
          canchas: this.convertirCanchasAUbicacion(this.canchas),
          filtros: this.filterForm.value
        }
      });
    }
  }

  private convertirCanchasAUbicacion(canchas: SearchCancha[]): UbicacionCancha[] {
    return canchas.map(c => ({
      id: c.idCancha!,
      nombre: c.nombre,
      direccion: c.direccion || '',
      distrito: c.ubigeo?.distrito || '',
      provincia: c.ubigeo?.provincia || '',
      lat: c.latitud!,
      lng: c.longitud!,
      precioDesde: c.precio || 0,
      deportes: c.tipoDeportes?.map((t: any) => t.nombre) || [''],
      imagenUrl: c.urlImagen || 'assets/images/default-field.png',
      calificacion: c.calificacionPromedio || 0,
      totalResenas: 0
    }));
  }

  /**
   * Toggle mostrar/ocultar filtros
   */
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

}

function normalizeDateString(dateStr: string): string {
  if (!dateStr) return dateStr;
  // Convierte un string tipo '2025-10-05' interpretándolo como fecha local, no UTC
  const utcDate = new Date(dateStr);
  const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0]; // Retorna 'YYYY-MM-DD'
}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
