import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltrosReservasComponent } from './filtros-reservas.component';

describe('FiltrosReservasComponent', () => {
  let fixture: ComponentFixture<FiltrosReservasComponent>;
  let component: FiltrosReservasComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FiltrosReservasComponent] });
    fixture = TestBed.createComponent(FiltrosReservasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('clears visible fields when the parent removes all active filters', () => {
    fixture.componentRef.setInput('filtrosActivos', { nombreCancha: 'El Gol', codigoEstado: '01', fechaDesde: '2026-10-01T00:00:00Z' });
    fixture.detectChanges();
    expect(component.filtrosForm.controls.nombreCancha.value).toBe('El Gol');
    fixture.componentRef.setInput('filtrosActivos', {});
    fixture.detectChanges();

    expect(Object.values(component.filtrosForm.getRawValue()).every(value => value === '')).toBeTrue();
    expect((fixture.nativeElement.querySelector('#reservation-from') as HTMLInputElement).value).toBe('');
  });

  it('rejects an inverted date range with a visible validation message', () => {
    const output = spyOn(component.filtrosChange, 'emit');
    component.filtrosForm.patchValue({ fechaDesde: '2026-10-30', fechaHasta: '2026-10-01' });
    component.onAplicarFiltros(); fixture.detectChanges();

    expect(output).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('La fecha final debe ser igual o posterior');
  });

  it('normalizes names and preserves the existing ISO date request contract', () => {
    const output = spyOn(component.filtrosChange, 'emit');
    component.filtrosForm.patchValue({ nombreCancha: '  El Gol  ', fechaDesde: '2026-10-01', fechaHasta: '2026-10-01' });
    component.onAplicarFiltros();

    expect(output).toHaveBeenCalledOnceWith({ nombreCancha: 'El Gol', fechaDesde: '2026-10-01T00:00:00.000Z', fechaHasta: '2026-10-01T00:00:00.000Z' });
  });
});
