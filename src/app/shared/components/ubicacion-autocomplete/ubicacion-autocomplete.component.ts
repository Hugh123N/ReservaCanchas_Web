import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { normalizarBusqueda, UbicacionOpcion } from '@shared/utils/ubicacion-options.utils';

@Component({
  selector: 'app-ubicacion-autocomplete',
  standalone: true,
  imports: [ReactiveFormsModule, OverlayModule, MatIconModule],
  templateUrl: './ubicacion-autocomplete.component.html',
  styleUrl: './ubicacion-autocomplete.component.css'
})
export class UbicacionAutocompleteComponent implements OnChanges, OnDestroy {
  @Input() options: UbicacionOpcion[] = [];
  @Input() selectedCode?: string;
  @Input() inputId = 'ubicacion';
  @Output() locationChange = new EventEmitter<UbicacionOpcion | undefined>();
  @ViewChild('input') private input?: ElementRef<HTMLInputElement>;

  readonly control = inject(FormBuilder).nonNullable.control('');
  readonly abierto = signal(false);
  readonly indiceActivo = signal(-1);
  private readonly opciones = signal<UbicacionOpcion[]>([]);
  private readonly consulta = signal('');
  readonly coincidencias = computed(() => {
    const query = normalizarBusqueda(this.consulta());
    const opciones = this.opciones();
    if (!query) return opciones.slice(0, 12);
    return opciones.filter(o => normalizarBusqueda(`${o.nombre} ${o.detalle}`).includes(query))
      .sort((a, b) => Number(normalizarBusqueda(b.nombre).startsWith(query)) - Number(normalizarBusqueda(a.nombre).startsWith(query)))
      .slice(0, 12);
  });
  private readonly subscription: Subscription = this.control.valueChanges.subscribe(value => {
    this.consulta.set(value);
    this.indiceActivo.set(-1);
    this.abierto.set(true);
    if (!value.trim() && this.selectedCode) this.locationChange.emit(undefined);
  });

  ngOnChanges(): void {
    this.opciones.set(this.options);
    const selected = this.options.find(o => o.codigo === this.selectedCode);
    this.control.setValue(selected ? `${selected.nombre} (${selected.tipo})` : '', { emitEvent: false });
  }

  ngOnDestroy(): void { this.subscription.unsubscribe(); }

  abrir(): void {
    this.consulta.set('');
    this.indiceActivo.set(-1);
    this.abierto.set(true);
  }

  cerrar(restaurar = true): void {
    this.abierto.set(false);
    if (restaurar) {
      const selected = this.options.find(o => o.codigo === this.selectedCode);
      this.control.setValue(selected ? `${selected.nombre} (${selected.tipo})` : '', { emitEvent: false });
    }
  }

  onOutsideClick(event: MouseEvent): void {
    if (!this.input?.nativeElement.parentElement?.contains(event.target as Node)) this.cerrar();
  }

  seleccionar(option: UbicacionOpcion): void {
    this.control.setValue(`${option.nombre} (${option.tipo})`, { emitEvent: false });
    this.cerrar(false);
    this.locationChange.emit(option);
  }

  limpiar(): void {
    this.control.setValue('', { emitEvent: false });
    this.consulta.set('');
    this.cerrar(false);
    this.locationChange.emit(undefined);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); this.cerrar(); return; }
    if (event.key === 'Tab') { this.cerrar(); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.abierto()) this.abrir();
      const count = this.coincidencias().length;
      if (count) {
        const current = this.indiceActivo();
        const next = current < 0 ? (event.key === 'ArrowDown' ? 0 : count - 1) : (current + (event.key === 'ArrowDown' ? 1 : -1) + count) % count;
        this.indiceActivo.set(next);
        queueMicrotask(() => document.getElementById(`${this.inputId}-option-${next}`)?.scrollIntoView({ block: 'nearest' }));
      }
      return;
    }
    if (event.key === 'Enter' && this.abierto() && this.coincidencias().length) {
      event.preventDefault();
      this.seleccionar(this.coincidencias()[Math.max(0, this.indiceActivo())]);
    }
  }
}
