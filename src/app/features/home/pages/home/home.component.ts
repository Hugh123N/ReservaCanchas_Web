import { Component, Inject, OnInit, ViewContainerRef, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';
import { BaseSearchComponent } from '@base/components/base-search-component/search-base.component';
import { SeoService } from 'app/features/seo/core/services/seo.service';
import { SearchBarComponent, SearchBarData } from '@shared/components/search-bar/search-bar.component';
import { Ubigeo } from 'app/features/canchas/core/model/ubigeo/ubigeo.model';
import { UbigeoService } from 'app/features/canchas/core/services/ubigeo.service';
import { GetTipoDeporte } from 'app/features/cancha-tipo/core/model/getTipoDeporte.model';
import { TipoDeporteService } from 'app/features/cancha-tipo/core/services/tipo-deporte.service';

interface HomeBanner {
  id: number;
  cssClass: string;
  desktop: string;
  mobile: string;
  label: string;
  titleLines: { text: string; accent?: boolean }[][];
  description: string;
  emphasis?: string;
  descriptionEnd?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatIconModule, CommonModule, RouterModule, FooterComponent, NavVarComponent, SearchBarComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent extends BaseSearchComponent implements OnInit {

  selectedDate: Date | null = null;
  selectedTime = '';
  idTipoDeporte = '';
  selectedUbigeo: Ubigeo | null = null;
  tipoDeportes: GetTipoDeporte[] = [];
  ubigeos: Ubigeo[] = [];

  readonly slides: HomeBanner[] = [
    {
      id: 1, cssClass: 's1', label: 'Reserva tu cancha deportiva favorita',
      desktop: 'assets/banners/banner1-desktop.webp', mobile: 'assets/banners/banner1-mobile.webp',
      titleLines: [
        [{ text: 'Reserva ' }, { text: 'tu', accent: true }, { text: ' cancha' }],
        [{ text: 'deportiva favorita' }]
      ],
      description: 'Encuentra y reserva canchas de fútbol, tenis, básquetbol, pádel y más.',
      emphasis: 'La plataforma más completa',
      descriptionEnd: 'para deportistas y propietarios de canchas.'
    },
    {
      id: 2, cssClass: 's2', label: 'Canchas para todos los deportes',
      desktop: 'assets/banners/banner2-desktop.webp', mobile: 'assets/banners/banner2-mobile.webp',
      titleLines: [[{ text: 'Canchas para' }], [{ text: 'todos los deportes', accent: true }]],
      description: 'Fútbol, tenis, básquetbol, pádel, vóley y más.',
      descriptionEnd: 'Elige tu deporte, encuentra la mejor opción y reserva en minutos.'
    },
    {
      id: 3, cssClass: 's3', label: 'Canchas cerca de ti',
      desktop: 'assets/banners/banner3-desktop.webp', mobile: 'assets/banners/banner3-mobile.webp',
      titleLines: [[{ text: 'Canchas ' }, { text: 'cerca de ti', accent: true }]],
      description: 'Descubre canchas en tu ciudad, compara precios, verifica disponibilidad y reserva al instante.'
    }
  ];
  readonly currentSlide = signal(0);
  private slideTimer: ReturnType<typeof setInterval> | null = null;

  readonly pasos = [
    { numero: 1, titulo: 'Busca', icono: 'search', descripcion: 'Elige ciudad, deporte y fecha. Te mostramos las canchas disponibles con precios y fotos reales.' },
    { numero: 2, titulo: 'Elige tu horario', icono: 'schedule', descripcion: 'Compara disponibilidad en tiempo real y reserva el momento que mejor te queda.' },
    { numero: 3, titulo: 'Paga y juega', icono: 'check_circle', descripcion: 'Confirma al instante con Yape, Plin, tarjeta o en local, y recibe tu comprobante en el momento.' },
  ];

  constructor(
    private router: Router,
    private ubigeoService: UbigeoService,
    private tipoDeporteService: TipoDeporteService,
    private seoService: SeoService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('CANCHAS', viewContainerRef);
  }

  ngOnInit() {
    this.seoService.setHome();
    this.cargarUbigeos();
    this.cargarTipoDeportes();
    this.startCarousel();
  }

  goToSlide(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.slides.length) return;
    this.currentSlide.set(index);
    this.startCarousel();
  }

  onSlideImgError(event: Event): void {
    // Si falta la imagen, se elimina y queda visible el gradiente de respaldo
    (event.target as HTMLImageElement | null)?.remove();
  }

  private startCarousel(): void {
    this.stopCarousel();
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.slideTimer = setInterval(() => {
      this.currentSlide.update(index => (index + 1) % this.slides.length);
    }, 5000);
  }

  private stopCarousel(): void {
    if (this.slideTimer !== null) {
      clearInterval(this.slideTimer);
      this.slideTimer = null;
    }
  }

  override ngOnDestroy(): void {
    this.stopCarousel();
    super.ngOnDestroy();
  }

  onSearchBarSearch(searchData: SearchBarData): void {
    this.selectedDate = searchData.fecha || null;
    this.selectedTime = searchData.hora || '';
    this.idTipoDeporte = searchData.idTipoDeporte || '';
    this.selectedUbigeo = searchData.ciudad && typeof searchData.ciudad === 'object' ? searchData.ciudad : null;

    void this.router.navigate(['/cancha/canchas'], {
      queryParams: {
        fecha: this.selectedDate ? formatDateLocal(this.selectedDate) : null,
        hora: this.selectedTime,
        idTipoDeporte: this.idTipoDeporte,
        codigoUbigeo: this.selectedUbigeo?.codigoUbigeo
      }
    });
  }

  onSearchBarClear(): void {
    this.selectedDate = null;
    this.selectedTime = '';
    this.idTipoDeporte = '';
    this.selectedUbigeo = null;
  }

  private cargarUbigeos(): void {
    this.subscriptions.push(this.ubigeoService.listAll().subscribe({
      next: response => { if (response.isValid) this.ubigeos = response.data; },
      error: error => this.openAlert(error)
    }));
  }

  private cargarTipoDeportes(): void {
    this.subscriptions.push(this.tipoDeporteService.SelectCombo().subscribe({
      next: response => { if (response.isValid) this.tipoDeportes = response.data; },
      error: error => this.openAlert(error)
    }));
  }
}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
