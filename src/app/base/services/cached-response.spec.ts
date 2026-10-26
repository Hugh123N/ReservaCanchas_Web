import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { ConfigService } from '@core/services/config.service';
import { TipoDeporteService } from 'app/features/cancha-tipo/core/services/tipo-deporte.service';
import { UbigeoService } from 'app/features/canchas/core/services/ubigeo.service';
import { ResponseDto } from '@base/models/api/response.dto';

const catalogs = [
  {
    name: 'UbigeoService.listAll',
    path: '/Ubigeo/listAll',
    load: () => TestBed.inject(UbigeoService).listAll(),
    clear: () => TestBed.inject(UbigeoService).clearCache(),
    data: [{ codigoUbigeo: '150101', departamento: 'Lima', provincia: 'Lima', distrito: 'Lima' }]
  },
  {
    name: 'TipoDeporteService.SelectCombo',
    path: '/TipoDeporte/selectcombo',
    load: () => TestBed.inject(TipoDeporteService).SelectCombo(),
    clear: () => TestBed.inject(TipoDeporteService).clearCache(),
    data: [{ idTipoDeporte: 1, codigo: 'FUTBOL', nombre: 'Fútbol' }]
  }
];

for (const catalog of catalogs) {
  describe(`${catalog.name} cache`, () => {
    let http: HttpTestingController;
    let load: () => Observable<ResponseDto<unknown>>;
    const url = `/api${catalog.path}`;
    const response = { isValid: true, messages: [], data: catalog.data };

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: ConfigService, useValue: { apiUrl: '/api' } }
        ]
      });
      http = TestBed.inject(HttpTestingController);
      load = catalog.load;
    });

    afterEach(() => http.verify());

    it('loads lazily, shares concurrent requests and replays the completed response', () => {
      const first = jasmine.createSpy('first');
      const second = jasmine.createSpy('second');
      const cached = jasmine.createSpy('cached');
      const pending$ = load();
      http.expectNone(url);

      pending$.subscribe(first);
      load().subscribe(second);
      http.expectOne(url).flush(response);
      load().subscribe(cached);

      expect(first).toHaveBeenCalledOnceWith(response);
      expect(second).toHaveBeenCalledOnceWith(response);
      expect(cached).toHaveBeenCalledOnceWith(response);
      http.expectNone(url);
    });

    it('finishes loading after the initiating view unsubscribes', () => {
      const subscription = load().subscribe();
      const request = http.expectOne(url);
      subscription.unsubscribe();

      expect(request.cancelled).toBeFalse();
      request.flush(response);
      const cached = jasmine.createSpy('cached');
      load().subscribe(cached);

      expect(cached).toHaveBeenCalledOnceWith(response);
      http.expectNone(url);
    });

    it('propagates HTTP errors and allows another request', () => {
      const error = jasmine.createSpy('error');
      load().subscribe({ error });
      http.expectOne(url).flush('Unavailable', { status: 503, statusText: 'Service Unavailable' });

      expect(error).toHaveBeenCalledTimes(1);
      load().subscribe();
      http.expectOne(url).flush(response);
    });

    it('delivers business errors without caching them', () => {
      const invalid = { ...response, isValid: false };
      const next = jasmine.createSpy('next');
      load().subscribe(next);
      http.expectOne(url).flush(invalid);

      expect(next).toHaveBeenCalledOnceWith(invalid);
      load().subscribe();
      http.expectOne(url).flush(response);
    });

    it('does not cache a valid response with missing data', () => {
      load().subscribe();
      http.expectOne(url).flush({ ...response, data: null });

      const next = jasmine.createSpy('next');
      load().subscribe(next);
      http.expectOne(url).flush(response);
      expect(next).toHaveBeenCalledOnceWith(response);
    });

    it('caches a valid empty catalog', () => {
      const empty = { ...response, data: [] };
      load().subscribe();
      http.expectOne(url).flush(empty);
      const cached = jasmine.createSpy('cached');
      load().subscribe(cached);

      expect(cached).toHaveBeenCalledOnceWith(empty);
      http.expectNone(url);
    });

    it('reloads after explicit invalidation', () => {
      load().subscribe();
      http.expectOne(url).flush(response);
      catalog.clear();

      const refreshed = { ...response, data: [] };
      const next = jasmine.createSpy('next');
      load().subscribe(next);
      http.expectOne(url).flush(refreshed);
      expect(next).toHaveBeenCalledOnceWith(refreshed);
    });

    it('does not discard a new request when an invalidated request fails later', () => {
      load().subscribe({ error: () => undefined });
      const previous = http.expectOne(url);
      catalog.clear();
      load().subscribe();
      const current = http.expectOne(url);
      previous.flush('Unavailable', { status: 503, statusText: 'Service Unavailable' });

      const next = jasmine.createSpy('next');
      load().subscribe(next);
      http.expectNone(url);
      current.flush(response);

      expect(next).toHaveBeenCalledOnceWith(response);
    });
  });
}
