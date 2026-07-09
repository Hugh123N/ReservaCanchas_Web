import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';
import { SearchBarComponent, SearchBarData } from '@shared/components/search-bar/search-bar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ubigeo } from 'app/features/canchas/core/model/ubigeo/ubigeo.model';
import { UbigeoService } from 'app/features/canchas/core/services/ubigeo.service';
import { BaseSearchComponent } from '@base/components/base-search-component/search-base.component';
import { GetTipoDeporte } from 'app/features/cancha-tipo/core/model/getTipoDeporte.model';
import { TipoDeporteService } from 'app/features/cancha-tipo/core/services/tipo-deporte.service';
import { SeoService } from 'app/features/seo/core/services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatChipsModule, MatDividerModule, MatToolbarModule,
    CommonModule,
    FooterComponent, NavVarComponent, SearchBarComponent,
    FormsModule, ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent extends BaseSearchComponent implements OnInit {

  selectedDate: Date | null = null;
  selectedTime: string = '';
  idTipoDeporte: string = '';
  selectedUbigeo: Ubigeo | null = null;

  tipoDeportes: GetTipoDeporte[] = [];
  ubigeos: Ubigeo[] = [];

  minDate = new Date();

  constructor(
    private router: Router,
    private ubigeoService: UbigeoService,
    private TipoDeporteService: TipoDeporteService,
    private seoService: SeoService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('CANCHAS', viewContainerRef);
  }

  ngOnInit() {
    this.seoService.setHome();
    this.cargarUbigeos();
    this.cargarTipoDeportes();
  }

  onRegistrarCancha() {
    console.log("Registrar nueva cancha")
    // Aquí iría la navegación al formulario de registro
  }

  onAccesoOperador() {
    console.log("Acceso operador")
    // Aquí iría la navegación al panel de operador
  }

  onSearchBarSearch(searchData: SearchBarData) {
    // Actualizar variables locales
    this.selectedDate = searchData.fecha || null;
    this.selectedTime = searchData.hora || '';
    this.idTipoDeporte = searchData.idTipoDeporte || '';
    if (searchData.ciudad && typeof searchData.ciudad === 'object') {
      this.selectedUbigeo = searchData.ciudad;
    } else {
      this.selectedUbigeo = null;
    }

    this.router.navigate(['/cancha/canchas'], {
      queryParams: {
        fecha: this.selectedDate ? formatDateLocal(this.selectedDate) : null,
        hora: this.selectedTime,
        idTipoDeporte: this.idTipoDeporte,
        codigoUbigeo: this.selectedUbigeo?.codigoUbigeo
      }
    });
  }

  onSearchBarClear() {
    this.selectedDate = null;
    this.selectedTime = '';
    this.idTipoDeporte = '';
    this.selectedUbigeo = null;
  }

  onExplorarCanchas() {
    this.router.navigate(['/cancha/canchas']);
  }

  onVerMapa() {
    this.router.navigate(['/cancha/mapa']);
  }

  private cargarUbigeos(): void {
    this.ubigeoService.listAll().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.ubigeos = response.data;
        }
      },
      error: (err) => this.openAlert(err),
    });
  }
  private cargarTipoDeportes(): void {
    this.TipoDeporteService.SelectCombo().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.tipoDeportes = response.data;
        }
      },
      error: (err) => this.openAlert(err),
    });
  }

}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}