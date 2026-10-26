import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ResponseDto } from '@base/models/api/response.dto';
import { TipoDeporteService } from 'app/features/cancha-tipo/core/services/tipo-deporte.service';
import { CanchaService } from '../../core/services/cancha.service';
import { UbigeoService } from '../../core/services/ubigeo.service';
import { Ubigeo } from '../../core/model/ubigeo/ubigeo.model';
import { CanchasComponent } from './canchas.component';

describe('CanchasComponent catalog initialization', () => {
  const lima: Ubigeo = {
    codigoUbigeo: '150101', departamento: 'Lima', provincia: 'Lima', distrito: 'Lima'
  };
  const callao: Ubigeo = {
    codigoUbigeo: '070101', departamento: 'Callao', provincia: 'Callao', distrito: 'Callao'
  };
  const response = Object.assign(new ResponseDto([lima, callao]), { isValid: true });
  let queryParams: BehaviorSubject<Params>;
  let ubigeoService: jasmine.SpyObj<UbigeoService>;

  beforeEach(() => {
    queryParams = new BehaviorSubject<Params>({ codigoUbigeo: lima.codigoUbigeo, idTipoDeporte: '1' });
    ubigeoService = jasmine.createSpyObj<UbigeoService>('UbigeoService', ['listAll']);
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams } },
        { provide: UbigeoService, useValue: ubigeoService },
        { provide: TipoDeporteService, useValue: { SelectCombo: () => of({ isValid: true, data: [] }) } }
      ]
    });
    TestBed.overrideComponent(CanchasComponent, {
      set: {
        template: '',
        imports: [],
        providers: [{ provide: CanchaService, useValue: {} }]
      }
    });
  });

  function initialize(): CanchasComponent {
    const component = TestBed.createComponent(CanchasComponent).componentInstance;
    spyOn(component, 'onSearch');
    component.ngOnInit();
    return component;
  }

  it('preserves the URL city when the catalog is replayed synchronously', () => {
    ubigeoService.listAll.and.returnValue(of(response));
    const component = initialize();

    expect(component.initialSearchData?.ciudad).toEqual(lima);
    expect(component.initialSearchData?.idTipoDeporte).toBe('1');
    expect(component.cityControl.value).toEqual(lima);
    expect(component.filterForm.controls.codigoUbigeo.value).toBe(lima.codigoUbigeo);
  });

  it('populates the URL city when the HTTP response arrives later', () => {
    const pending = new Subject<ResponseDto<Ubigeo[]>>();
    ubigeoService.listAll.and.returnValue(pending);
    const component = initialize();
    pending.next(response);
    pending.complete();

    expect(component.initialSearchData?.ciudad).toEqual(lima);
    expect(component.initialSearchData?.idTipoDeporte).toBe('1');
    expect(component.cityControl.value).toEqual(lima);
  });

  it('synchronizes subsequent URL changes using the loaded catalog', () => {
    ubigeoService.listAll.and.returnValue(of(response));
    const component = initialize();
    queryParams.next({ codigoUbigeo: callao.codigoUbigeo });

    expect(component.initialSearchData?.ciudad).toEqual(callao);
    expect(component.cityControl.value).toEqual(callao);
    expect(component.filterForm.controls.codigoUbigeo.value).toBe(callao.codigoUbigeo);
  });

  it('uses the current filter if the city changes while the catalog is loading', () => {
    const pending = new Subject<ResponseDto<Ubigeo[]>>();
    ubigeoService.listAll.and.returnValue(pending);
    const component = initialize();
    queryParams.next({ codigoUbigeo: callao.codigoUbigeo });
    pending.next(response);
    pending.complete();

    expect(component.initialSearchData?.ciudad).toEqual(callao);
    expect(component.cityControl.value).toEqual(callao);
  });
});
