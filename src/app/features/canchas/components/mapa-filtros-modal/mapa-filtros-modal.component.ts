import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Ubigeo } from '../../core/model/ubigeo/ubigeo.model';
import { GetTipoCancha } from 'app/features/cancha-tipo/core/model/getTipoCancha.model';

export interface FiltrosModalData {
  tiposDeporte: GetTipoCancha[];
  ubigeos: Ubigeo[];
  filtrosActuales: {
    idTipoCancha?: number;
    codigoUbigeo?: string;
    precioMax?: number;
    fecha?: string;
  };
}

/**
 * Componente de modal fullscreen para filtros de mapa en mobile
 * Permite seleccionar tipo de deporte, ubicación, precio máximo y fecha
 */
@Component({
  selector: 'app-mapa-filtros-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatSliderModule,
    MatDatepickerModule
  ],
  templateUrl: './mapa-filtros-modal.component.html',
  styleUrl: './mapa-filtros-modal.component.css'
})
export class MapaFiltrosModalComponent implements OnInit {
  filtrosForm!: FormGroup;
  precioMaxDisplay = 100;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FiltrosModalData,
    private dialogRef: MatDialogRef<MapaFiltrosModalComponent>,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.filtrosForm = this.fb.group({
      idTipoCancha: [this.data.filtrosActuales?.idTipoCancha],
      codigoUbigeo: [this.data.filtrosActuales?.codigoUbigeo],
      precioMax: [this.data.filtrosActuales?.precioMax || 100],
      fecha: [this.data.filtrosActuales?.fecha]
    });

    this.precioMaxDisplay = this.filtrosForm.value.precioMax;

    // Escuchar cambios en precioMax para actualizar display
    this.filtrosForm.get('precioMax')?.valueChanges.subscribe(value => {
      this.precioMaxDisplay = value;
    });
  }

  aplicarFiltros(): void {
    this.dialogRef.close(this.filtrosForm.value);
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      idTipoCancha: undefined,
      codigoUbigeo: undefined,
      precioMax: 100,
      fecha: undefined
    });
    this.precioMaxDisplay = 100;
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  formatLabel(value: number): string {
    return `S/ ${value}`;
  }
}
