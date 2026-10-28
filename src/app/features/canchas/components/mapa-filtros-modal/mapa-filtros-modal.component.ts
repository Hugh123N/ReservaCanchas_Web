import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UbicacionAutocompleteComponent } from '@shared/components/ubicacion-autocomplete/ubicacion-autocomplete.component';
import { UbicacionOpcion } from '@shared/utils/ubicacion-options.utils';
import { formatParaInput } from '@shared/utils/date.utils';
import { FormErrorComponent } from '@shared/components/form-error/form-error.component';
import { GetTipoDeporte } from 'app/features/cancha-tipo/core/model/getTipoDeporte.model';
import { SearchCanchaFilter } from '../../core/model/searchCanchaFilter.model';

export interface FiltrosMapaResultado {
  nombre: string | null;
  idTipoDeporte: number | null;
  codigoUbigeo: string | null;
  fecha: string | null;
  soloFavoritos: boolean;
  limpiarTodo?: boolean;
}

export interface FiltrosModalData {
  tipoDeportes: GetTipoDeporte[];
  ubicaciones: UbicacionOpcion[];
  cantidadFavoritos: number;
  isAuthenticated: boolean;
  filtrosActuales: SearchCanchaFilter;
}

@Component({
  selector: 'app-mapa-filtros-modal', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatDialogModule, MatIconModule, UbicacionAutocompleteComponent, FormErrorComponent],
  templateUrl: './mapa-filtros-modal.component.html',
  styleUrl: './mapa-filtros-modal.component.css'
})
export class MapaFiltrosModalComponent {
  readonly fechaMinima = formatParaInput(new Date());
  readonly filtrosForm;
  reiniciarBusqueda = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FiltrosModalData,
    private dialogRef: MatDialogRef<MapaFiltrosModalComponent, FiltrosMapaResultado>,
    fb: FormBuilder
  ) {
    this.filtrosForm = fb.group({
      nombre: [data.filtrosActuales.nombre ?? '', Validators.maxLength(120)],
      idTipoDeporte: [data.filtrosActuales.idTipoDeporte ?? null],
      codigoUbigeo: [data.filtrosActuales.codigoUbigeo ?? null],
      fecha: [data.filtrosActuales.fecha ?? null],
      soloFavoritos: [{ value: data.filtrosActuales.soloFavoritos ?? false, disabled: !data.isAuthenticated }]
    });
  }

  aplicarFiltros(): void {
    if (this.filtrosForm.invalid) {
      this.filtrosForm.markAllAsTouched();
      return;
    }
    const values = this.filtrosForm.getRawValue();
    this.dialogRef.close({ ...values, nombre: values.nombre?.trim() || null,
      soloFavoritos: this.data.isAuthenticated && !!values.soloFavoritos, limpiarTodo: this.reiniciarBusqueda });
  }

  limpiarFiltros(): void {
    this.reiniciarBusqueda = true;
    this.filtrosForm.reset({ nombre: '', idTipoDeporte: null, codigoUbigeo: null, fecha: null, soloFavoritos: false });
  }

  cerrar(): void { this.dialogRef.close(); }
}
