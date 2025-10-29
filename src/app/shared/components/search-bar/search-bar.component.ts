import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { Observable, map, startWith } from 'rxjs';

import { Ubigeo } from 'app/features/canchas/core/model/ubigeo/ubigeo.model';
import { GetTipoCancha } from 'app/features/cancha-tipo/core/model/getTipoCancha.model';

export interface SearchBarData {
  ciudad?: Ubigeo | string | null;
  idTipoCancha?: string;
  fecha?: Date | null;
  hora?: string;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatAutocompleteModule,
    MatButtonModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent implements OnInit {
  @Input() canchaTipos: GetTipoCancha[] = [];
  @Input() ubigeos: Ubigeo[] = [];
  @Input() isLoading: boolean = false;
  @Input() maxWidth: 'large' | 'medium' = 'large'; // large = 6xl, medium = 5xl

  @Output() search = new EventEmitter<SearchBarData>();
  @Output() clear = new EventEmitter<void>();

  searchForm!: FormGroup;
  cityControl = new FormControl<Ubigeo | string | null>(null);
  filteredUbigeos!: Observable<Ubigeo[]>;
  minDate = new Date();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      idTipoCancha: [''],
      fecha: [null],
      hora: ['']
    });

    this.filteredUbigeos = this.cityControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterUbigeos(value))
    );
  }

  private _filterUbigeos(value: string | Ubigeo | null): Ubigeo[] {
    if (!value || typeof value !== 'string') {
      return this.ubigeos;
    }
    const filterValue = value.toLowerCase();
    return this.ubigeos.filter(ubigeo =>
      ubigeo.distrito?.toLowerCase().includes(filterValue) ||
      ubigeo.provincia?.toLowerCase().includes(filterValue) ||
      ubigeo.departamento?.toLowerCase().includes(filterValue)
    );
  }

  displayUbigeo(ubigeo: Ubigeo): string {
    return ubigeo && ubigeo.distrito ? `${ubigeo.distrito}, ${ubigeo.departamento}` : '';
  }

  onSearch(): void {
    const searchData: SearchBarData = {
      ciudad: this.cityControl.value,
      idTipoCancha: this.searchForm.value.idTipoCancha,
      fecha: this.searchForm.value.fecha,
      hora: this.searchForm.value.hora
    };
    this.search.emit(searchData);
  }

  onClear(): void {
    this.searchForm.reset({
      idTipoCancha: '',
      fecha: null,
      hora: ''
    });
    this.cityControl.reset();
    this.clear.emit();
  }

  get maxWidthClass(): string {
    return this.maxWidth === 'large' ? 'max-w-6xl' : 'max-w-5xl';
  }
}
