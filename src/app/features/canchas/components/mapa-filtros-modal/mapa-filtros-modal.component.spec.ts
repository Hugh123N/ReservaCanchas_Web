import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { FiltrosModalData, MapaFiltrosModalComponent } from './mapa-filtros-modal.component';

describe('MapaFiltrosModalComponent', () => {
  const data: FiltrosModalData = {
    ubicaciones: [], tipoDeportes: [], cantidadFavoritos: 2, isAuthenticated: true,
    filtrosActuales: { idTipoDeporte: 3, codigoUbigeo: '1501' }
  };
  let ref: jasmine.SpyObj<MatDialogRef<MapaFiltrosModalComponent>>;

  beforeEach(() => {
    ref = jasmine.createSpyObj('MatDialogRef', ['close']);
    TestBed.configureTestingModule({
      imports: [MapaFiltrosModalComponent],
      providers: [provideRouter([]), { provide: MAT_DIALOG_DATA, useValue: { ...data } }, { provide: MatDialogRef, useValue: ref }]
    });
  });

  it('restores the existing sport using idTipoDeporte and returns the same contract', () => {
    const component = TestBed.createComponent(MapaFiltrosModalComponent).componentInstance;
    component.aplicarFiltros();

    expect(ref.close).toHaveBeenCalledWith(jasmine.objectContaining({ idTipoDeporte: 3, codigoUbigeo: '1501' }));
  });

  it('prevents guests from enabling the favorites filter', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { ...data, isAuthenticated: false, filtrosActuales: { soloFavoritos: true } } });
    const component = TestBed.createComponent(MapaFiltrosModalComponent).componentInstance;
    component.aplicarFiltros();

    expect(component.filtrosForm.controls.soloFavoritos.disabled).toBeTrue();
    expect(ref.close).toHaveBeenCalledWith(jasmine.objectContaining({ soloFavoritos: false }));
  });

  it('restores the cancha name and returns a trimmed search term', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { ...data, filtrosActuales: { ...data.filtrosActuales, nombre: '  El Gol  ' } } });
    const component = TestBed.createComponent(MapaFiltrosModalComponent).componentInstance;
    expect(component.filtrosForm.controls.nombre.value).toBe('  El Gol  ');
    component.aplicarFiltros();

    expect(ref.close).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'El Gol', limpiarTodo: false }));
  });

  it('clears the name and requests a complete reset of inherited map filters', () => {
    const component = TestBed.createComponent(MapaFiltrosModalComponent).componentInstance;
    component.filtrosForm.controls.nombre.setValue('El Gol');
    component.limpiarFiltros();
    component.aplicarFiltros();

    expect(ref.close).toHaveBeenCalledWith({ nombre: null, idTipoDeporte: null, codigoUbigeo: null,
      fecha: null, soloFavoritos: false, limpiarTodo: true });
  });

  it('does not apply an invalid name and marks the field for its validation message', () => {
    const component = TestBed.createComponent(MapaFiltrosModalComponent).componentInstance;
    component.filtrosForm.controls.nombre.setValue('a'.repeat(121));
    component.aplicarFiltros();

    expect(ref.close).not.toHaveBeenCalled();
    expect(component.filtrosForm.controls.nombre.touched).toBeTrue();
    expect(component.filtrosForm.controls.nombre.hasError('maxlength')).toBeTrue();
  });
});
