import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { UbicacionAutocompleteComponent } from './ubicacion-autocomplete.component';
import { UbicacionOpcion } from '@shared/utils/ubicacion-options.utils';

describe('UbicacionAutocompleteComponent', () => {
  let fixture: ComponentFixture<UbicacionAutocompleteComponent>;
  let component: UbicacionAutocompleteComponent;
  let overlay: HTMLElement;
  const options: UbicacionOpcion[] = [
    { codigo: '1501', nombre: 'Lima', detalle: 'Provincia · Lima', tipo: 'provincia' },
    { codigo: '150136', nombre: 'San Miguel', detalle: 'Distrito · Lima, Lima', tipo: 'distrito' },
    { codigo: '220901', nombre: 'Tarapoto', detalle: 'Distrito · San Martín', tipo: 'distrito' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [UbicacionAutocompleteComponent] });
    fixture = TestBed.createComponent(UbicacionAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inputId', 'test-location');
    fixture.componentRef.setInput('options', options);
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
    fixture.detectChanges();
  });

  it('keeps the dropdown open when clicking the combobox itself', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.focus();
    input.click();
    fixture.detectChanges();

    expect(component.abierto()).toBeTrue();
    expect(overlay.querySelectorAll('[role="option"]').length).toBe(3);
  });

  it('finds provinces and districts without accents and selects through the keyboard', () => {
    const selected = spyOn(component.locationChange, 'emit');
    component.control.setValue('san martin');
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(selected).toHaveBeenCalledOnceWith(options[2]);
    expect(component.control.value).toBe('Tarapoto (distrito)');
    expect(component.abierto()).toBeFalse();
  });

  it('starts at the last option when pressing ArrowUp from no active option', () => {
    component.abrir();
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(component.indiceActivo()).toBe(2);
  });

  it('restores the applied location after abandoning unselected text', () => {
    fixture.componentRef.setInput('selectedCode', '1501');
    fixture.detectChanges();
    component.control.setValue('otra zona');
    component.cerrar();

    expect(component.control.value).toBe('Lima (provincia)');
  });

  it('emits an explicit clear when the selected location is erased', () => {
    fixture.componentRef.setInput('selectedCode', '1501');
    fixture.detectChanges();
    const selected = spyOn(component.locationChange, 'emit');
    component.limpiar();

    expect(selected).toHaveBeenCalledOnceWith(undefined);
    expect(component.abierto()).toBeFalse();
  });
});
