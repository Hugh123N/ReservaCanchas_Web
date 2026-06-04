import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { Ubigeo } from 'app/features/canchas/core/model/ubigeo/ubigeo.model';
import { GetTipoDeporte } from 'app/features/cancha-tipo/core/model/getTipoDeporte.model';

export interface SearchBarData {
  ciudad?: Ubigeo | string | null;
  idTipoDeporte?: string;
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
    MatIconModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent implements OnInit {
  @Input() tipoDeportes: GetTipoDeporte[] = [];
  @Input() ubigeos: Ubigeo[] = [];
  @Input() isLoading: boolean = false;
  @Input() maxWidth: 'large' | 'medium' = 'large';

  @Output() search = new EventEmitter<SearchBarData>();
  @Output() clear = new EventEmitter<void>();

  // Form
  searchForm!: FormGroup;
  cityControl = new FormControl<Ubigeo | string | null>(null);

  // Ciudad autocomplete
  filteredUbigeos: Ubigeo[] = [];
  showCityDropdown = false;

  // Deporte custom select
  isDeporteOpen = false;
  selectedDeporte: GetTipoDeporte | null = null;

  // Fecha datepicker
  isDatepickerOpen = false;
  selectedFecha: Date | null = null;
  calendarMonth: number;
  calendarYear: number;
  calendarDays: (number | null)[][] = [];
  weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  get deporteLabel(): string {
    return this.selectedDeporte ? this.selectedDeporte.nombre : 'Todos los deportes';
  }

  get fechaLabel(): string {
    if (!this.selectedFecha) return 'Seleccionar fecha';
    const day = String(this.selectedFecha.getDate()).padStart(2, '0');
    const month = String(this.selectedFecha.getMonth() + 1).padStart(2, '0');
    const year = this.selectedFecha.getFullYear();
    return `${day}/${month}/${year}`;
  }

  get calendarMonthName(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[this.calendarMonth];
  }

  constructor() {
    const today = new Date();
    this.calendarMonth = today.getMonth();
    this.calendarYear = today.getFullYear();
  }

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      idTipoDeporte: new FormControl(''),
      fecha: new FormControl(null),
      hora: new FormControl('')
    });

    this.cityControl.valueChanges.subscribe(value => {
      this.filteredUbigeos = this._filterUbigeos(value);
      this.showCityDropdown = this.filteredUbigeos.length > 0;
    });
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

  selectUbigeo(ubigeo: Ubigeo): void {
    this.cityControl.setValue(ubigeo);
    this.showCityDropdown = false;
  }

  toggleDeporte(): void {
    this.isDeporteOpen = !this.isDeporteOpen;
    this.isDatepickerOpen = false;
    this.showCityDropdown = false;
  }

  selectDeporte(deporte: GetTipoDeporte | null): void {
    this.selectedDeporte = deporte;
    this.searchForm.patchValue({ idTipoDeporte: deporte?.idTipoDeporte ?? '' });
    this.isDeporteOpen = false;
  }

  toggleDatepicker(): void {
    this.isDatepickerOpen = !this.isDatepickerOpen;
    this.isDeporteOpen = false;
    this.showCityDropdown = false;
    if (this.isDatepickerOpen) {
      this.calendarMonth = this.selectedFecha
        ? this.selectedFecha.getMonth()
        : new Date().getMonth();
      this.calendarYear = this.selectedFecha
        ? this.selectedFecha.getFullYear()
        : new Date().getFullYear();
      this.buildCalendar();
    }
  }

  isToday(day: number | null): boolean {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate()
      && this.calendarMonth === today.getMonth()
      && this.calendarYear === today.getFullYear();
  }

  isSelected(day: number | null): boolean {
    if (!day || !this.selectedFecha) return false;
    return day === this.selectedFecha.getDate()
      && this.calendarMonth === this.selectedFecha.getMonth()
      && this.calendarYear === this.selectedFecha.getFullYear();
  }

  isPastDay(day: number | null): boolean {
    if (!day) return true;
    const date = new Date(this.calendarYear, this.calendarMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  selectDate(day: number | null): void {
    if (!day || this.isPastDay(day)) return;
    this.selectedFecha = new Date(this.calendarYear, this.calendarMonth, day);
    this.searchForm.patchValue({ fecha: this.selectedFecha });
    this.isDatepickerOpen = false;
  }

  prevMonth(): void {
    if (this.calendarMonth === 0) {
      this.calendarMonth = 11;
      this.calendarYear--;
    } else {
      this.calendarMonth--;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.calendarMonth === 11) {
      this.calendarMonth = 0;
      this.calendarYear++;
    } else {
      this.calendarMonth++;
    }
    this.buildCalendar();
  }

  buildCalendar(): void {
    const firstDay = new Date(this.calendarYear, this.calendarMonth, 1).getDay();
    const daysInMonth = new Date(this.calendarYear, this.calendarMonth + 1, 0).getDate();

    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      week.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    this.calendarDays = weeks;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isInside = target.closest('.search-field,.btn-clear');
    if (!isInside) {
      this.isDeporteOpen = false;
      this.isDatepickerOpen = false;
      this.showCityDropdown = false;
    }
  }

  onSearch(): void {
    const searchData: SearchBarData = {
      ciudad: this.cityControl.value,
      idTipoDeporte: this.searchForm.value.idTipoDeporte,
      fecha: this.selectedFecha,
      hora: this.searchForm.value.hora
    };
    this.search.emit(searchData);
  }

  onClear(): void {
    this.searchForm.reset({
      idTipoDeporte: '',
      fecha: null,
      hora: ''
    });
    this.cityControl.reset();
    this.selectedDeporte = null;
    this.selectedFecha = null;
    this.isDeporteOpen = false;
    this.isDatepickerOpen = false;
    this.showCityDropdown = false;
    this.clear.emit();
  }

  get maxWidthClass(): string {
    return this.maxWidth === 'large' ? 'max-w-6xl' : 'max-w-5xl';
  }
}
