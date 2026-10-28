import { signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import type { Map as MapboxMap } from 'mapbox-gl';
import { ResponseDto } from '@base/models/api/response.dto';
import { QueryResultsModel } from '@base/models/query/query-results.model';
import { MapboxService } from '@core/services/mapbox.service';
import { ResponsiveService } from '@core/services/responsive.service';
import { GeolocationService } from '@core/services/geolocation.service';
import { AuthService } from '@core/auth/services/auth.service';
import { TipoDeporteService } from 'app/features/cancha-tipo/core/services/tipo-deporte.service';
import { CanchaService } from '../../core/services/cancha.service';
import { UbigeoService } from '../../core/services/ubigeo.service';
import { CanchaFavoritaService } from '../../core/services/cancha-favorita.service';
import { SearchCancha } from '../../core/model/searchCancha.model';
import { MapaCanchasComponent } from './mapa-canchas.component';

describe('Mapa compact search field', () => {
  let fixture: ComponentFixture<MapaCanchasComponent>;
  let component: MapaCanchasComponent;
  let compact: BehaviorSubject<boolean>;
  let modal: jasmine.SpyObj<MatDialog>;
  let canchas: jasmine.SpyObj<CanchaService>;

  beforeEach(() => {
    compact = new BehaviorSubject(true);
    modal = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    modal.open.and.returnValue({ afterClosed: () => of(undefined) } as ReturnType<MatDialog['open']>);
    canchas = jasmine.createSpyObj<CanchaService>('CanchaService', ['search']);
    canchas.search.and.returnValue(of(Object.assign(new ResponseDto(new QueryResultsModel<SearchCancha>()), { isValid: true })));
    const maps = jasmine.createSpyObj<MapboxService>('MapboxService', ['inicializarMapa', 'obtenerMapa',
      'seleccionarMarcador', 'eliminarTodosMarcadoresCanchas', 'redimensionar', 'destruir']);
    const map = { on: () => map };
    maps.inicializarMapa.and.returnValue(map as unknown as MapboxMap);
    maps.obtenerMapa.and.returnValue(null);
    TestBed.configureTestingModule({
      imports: [MapaCanchasComponent],
      providers: [provideRouter([]),
        { provide: CanchaService, useValue: canchas },
        { provide: MapboxService, useValue: maps },
        { provide: ResponsiveService, useValue: { observe: () => compact } },
        { provide: GeolocationService, useValue: {} },
        { provide: AuthService, useValue: { isAuthenticated: () => false } },
        { provide: CanchaFavoritaService, useValue: { cantidadFavoritos: signal(0) } },
        { provide: UbigeoService, useValue: { listAll: () => of({ isValid: true, data: [
          { codigoUbigeo: '150136', distrito: 'San Miguel', provincia: 'Lima', departamento: 'Lima' }
        ] }) } },
        { provide: TipoDeporteService, useValue: { SelectCombo: () => of({ isValid: true, data: [
          { idTipoDeporte: 3, codigo: 'FUT', nombre: 'Fútbol' }
        ] }) } }
      ]
    }).overrideProvider(MatDialog, { useValue: modal });
    fixture = TestBed.createComponent(MapaCanchasComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => fixture.destroy());

  function iniciar(): void { fixture.detectChanges(); tick(); fixture.detectChanges(); }

  it('renders only the summary field on tablet and mobile and opens filters from its icon', fakeAsync(() => {
    iniciar();
    expect(fixture.nativeElement.querySelector('.map-filters')).toBeNull();
    expect(fixture.nativeElement.querySelector('.active-filters')).toBeNull();
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('.compact-search-trigger');
    expect(trigger.textContent).toContain('Todos los deportes • Todas las ubicaciones');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    (trigger.querySelector('mat-icon') as HTMLElement).click();

    expect(modal.open).toHaveBeenCalledTimes(1);
  }));

  it('summarizes the chosen sport, district and visible area reactively', fakeAsync(() => {
    iniciar();
    component.filtroActual.set({ idTipoDeporte: 3, codigoUbigeo: '150136' });
    fixture.detectChanges();
    expect(component.resumenBusqueda()).toBe('Fútbol • San Miguel');
    component.filtroActual.set({ idTipoDeporte: 3, codigoUbigeo: '1501' });
    expect(component.resumenBusqueda()).toBe('Fútbol • Lima');
    component.filtroActual.set({ area: { norte: -12, sur: -13, este: -77, oeste: -78 } });
    fixture.detectChanges();

    expect(component.resumenBusqueda()).toBe('Todos los deportes • Zona visible del mapa');
    expect(fixture.nativeElement.querySelector('.active-filters')).toBeNull();
  }));

  it('keeps desktop fields when switching out of the compact layout', fakeAsync(() => {
    iniciar();
    compact.next(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.compact-search-trigger')).toBeNull();
    expect(fixture.nativeElement.querySelector('#map-zone')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#map-sport')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#map-name')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.filter-button')).not.toBeNull();
  }));

  it('applies modal name and location once, updates the summary and synchronizes desktop controls', fakeAsync(() => {
    iniciar();
    canchas.search.calls.reset();
    modal.open.and.returnValue({ afterClosed: () => of({ nombre: '  El Gol  ', idTipoDeporte: 3,
      codigoUbigeo: '150136', fecha: null, soloFavoritos: false }) } as ReturnType<MatDialog['open']>);
    (fixture.nativeElement.querySelector('.compact-search-trigger') as HTMLButtonElement).click();
    tick(); fixture.detectChanges();

    expect(canchas.search).toHaveBeenCalledTimes(1);
    expect(canchas.search.calls.mostRecent().args[0].filter).toEqual(jasmine.objectContaining({
      nombre: 'El Gol', idTipoDeporte: 3, codigoUbigeo: '150136'
    }));
    expect(component.resumenBusqueda()).toBe('Fútbol • San Miguel');
    compact.next(false);
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('#map-name') as HTMLInputElement).value).toBe('El Gol');
  }));

  it('removes the inherited map area and hour when clearing all filters in the modal', fakeAsync(() => {
    iniciar();
    component.filtroActual.set({ area: { norte: -12, sur: -13, este: -77, oeste: -78 }, hora: '18:00', nombre: 'Anterior' });
    modal.open.and.returnValue({ afterClosed: () => of({ nombre: null, idTipoDeporte: null,
      codigoUbigeo: null, fecha: null, soloFavoritos: false, limpiarTodo: true }) } as ReturnType<MatDialog['open']>);
    component.abrirFiltrosModal(); tick(); fixture.detectChanges();

    expect(component.filtroActual().area).toBeUndefined();
    expect(component.filtroActual().hora).toBeUndefined();
    expect(component.filtroActual().nombre).toBeUndefined();
    expect(component.resumenBusqueda()).toBe('Todos los deportes • Todas las ubicaciones');
  }));

  it('does not change filters or query again when the modal is dismissed', fakeAsync(() => {
    iniciar();
    component.filtroActual.set({ idTipoDeporte: 3, codigoUbigeo: '150136' });
    canchas.search.calls.reset();
    component.abrirFiltrosModal(); tick();

    expect(canchas.search).not.toHaveBeenCalled();
    expect(component.resumenBusqueda()).toBe('Fútbol • San Miguel');
  }));
});
