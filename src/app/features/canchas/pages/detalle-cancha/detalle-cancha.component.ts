import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';

import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-cancha',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavVarComponent,
    FooterComponent,

    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './detalle-cancha.component.html',
  styleUrl: './detalle-cancha.component.css'
})
export class DetalleCanchaComponent {
  reservaForm: FormGroup;

  fechas = [
    { dia: 'Hoy', fecha: '06 Sep', disponible: true },
    { dia: 'Dom', fecha: '07 Sep', disponible: true },
    { dia: 'Lun', fecha: '08 Sep', disponible: false },
    { dia: 'Mar', fecha: '09 Sep', disponible: false },
    { dia: 'Mié', fecha: '10 Sep', disponible: false }
  ];

  horarios = ['08:00', '09:00', '10:00', '11:00', '21:00', '22:00'];



  constructor(private fb: FormBuilder) {
    this.reservaForm = this.fb.group({
      fecha: ['', Validators.required],
      horario: ['', Validators.required],
      duracion: [1, Validators.required], // ahora es numérico
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      observaciones: ['']
    });
  }

  onReservar() {
    if (this.reservaForm.valid) {
      console.log('Reserva confirmada:', this.reservaForm.value);
    }
  }
}
