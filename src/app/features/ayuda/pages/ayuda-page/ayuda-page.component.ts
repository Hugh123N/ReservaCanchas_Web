import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { BaseComponent } from '@base/components/base-component/base.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { SeoService } from '../../../seo/core/services/seo.service';
import {
  PASOS_PROCESO,
  PREGUNTAS_FRECUENTES,
  CONTACTO,
  CATEGORIAS
} from '../../core/services/ayuda.data';
import { PreguntaFrecuente, PasoProceso } from '../../core/models/pregunta.model';

@Component({
  selector: 'app-ayuda-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    NavVarComponent,
    FooterComponent
  ],
  templateUrl: './ayuda-page.component.html',
  styleUrl: './ayuda-page.component.css'
})
export class AyudaPageComponent extends BaseComponent implements OnInit {

  pasos: PasoProceso[] = PASOS_PROCESO;
  preguntas: PreguntaFrecuente[] = PREGUNTAS_FRECUENTES;
  preguntasFiltradas: PreguntaFrecuente[] = PREGUNTAS_FRECUENTES;
  categorias = CATEGORIAS;
  contacto = CONTACTO;

  categoriaSeleccionada = '';
  busqueda = '';
  panelAbierto = false;

  constructor(
    private seoService: SeoService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('AYUDA', viewContainerRef);
  }

  ngOnInit(): void {
    this.seoService.updateTags({
      titulo: 'Centro de Ayuda | ReservaFast',
      descripcion: 'Encuentra respuestas a tus preguntas sobre cómo reservar canchas deportivas, pagos, cancelaciones y contacto.',
      url: '/ayuda',
      keywords: ['ayuda', 'soporte', 'preguntas frecuentes', 'reserva canchas']
    });
  }

  onBuscar(): void {
    const termino = this.busqueda.toLowerCase().trim();

    this.preguntasFiltradas = this.preguntas.filter(p => {
      const coincideBusqueda = !termino ||
        p.pregunta.toLowerCase().includes(termino) ||
        p.respuesta.toLowerCase().includes(termino);

      const coincideCategoria = !this.categoriaSeleccionada ||
        p.categoria === this.categoriaSeleccionada;

      return coincideBusqueda && coincideCategoria;
    });
  }

  onSeleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = this.categoriaSeleccionada === categoria ? '' : categoria;
    this.onBuscar();
  }

  onLimpiarFiltros(): void {
    this.busqueda = '';
    this.categoriaSeleccionada = '';
    this.preguntasFiltradas = this.preguntas;
  }
}
