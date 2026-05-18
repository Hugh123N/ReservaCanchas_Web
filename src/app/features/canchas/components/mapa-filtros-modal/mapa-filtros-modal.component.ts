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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Ubigeo } from '../../core/model/ubigeo/ubigeo.model';
import { GetTipoDeporte } from 'app/features/cancha-tipo/core/model/getTipoDeporte.model';

export interface FiltrosModalData {
  tipoDeportes: GetTipoDeporte[];
  ubigeos: Ubigeo[];
  cantidadFavoritos: number;
  filtrosActuales: {
    idTipoCancha?: number;
    codigoUbigeo?: string;
    fecha?: string;
    soloFavoritos?: boolean;
  };
}

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
    MatDatepickerModule,
    MatSlideToggleModule
  ],
  templateUrl: './mapa-filtros-modal.component.html',
  styleUrl: './mapa-filtros-modal.component.css'
})
export class MapaFiltrosModalComponent implements OnInit {
  filtrosForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FiltrosModalData,
    private dialogRef: MatDialogRef<MapaFiltrosModalComponent>,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.filtrosForm = this.fb.group({
      idTipoCancha: [this.data.filtrosActuales?.idTipoCancha],
      codigoUbigeo: [this.data.filtrosActuales?.codigoUbigeo],
      fecha: [this.data.filtrosActuales?.fecha],
      soloFavoritos: [this.data.filtrosActuales?.soloFavoritos || false]
    });
 
  }

  aplicarFiltros(): void {
    this.dialogRef.close(this.filtrosForm.value);
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      idTipoCancha: undefined,
      codigoUbigeo: undefined,
      fecha: undefined,
      soloFavoritos: false
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  formatLabel(value: number): string {
    return `S/ ${value}`;
  }
}
