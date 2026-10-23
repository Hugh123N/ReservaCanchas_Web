import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { BaseComponent } from '@base/components/base-component/base.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { SeoService } from '../../../seo/core/services/seo.service';
import {
  AUDIENCIAS,
  PASOS_CLIENTE,
  PASOS_DUENO,
  PREGUNTAS_CLIENTE,
  PREGUNTAS_DUENO,
  CATEGORIAS_CLIENTE,
  CATEGORIAS_DUENO,
  CONTACTO,
  PANEL_PROVEEDOR_URL,
  MENSAJES_WHATSAPP
} from '../../core/services/ayuda.data';
import {
  Audiencia,
  AyudaAudience,
  PreguntaFrecuente,
  PasoProceso
} from '../../core/models/pregunta.model';

@Component({
  selector: 'app-ayuda-page',
  standalone: true,
  imports: [
    CommonModule,
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

  readonly audiencias: AyudaAudience[] = AUDIENCIAS;
  readonly contacto = CONTACTO;
  readonly panelProveedorUrl = PANEL_PROVEEDOR_URL;

  audience: Audiencia = 'cliente';
  categoriaSeleccionada = '';

  constructor(
    private seoService: SeoService,
    private router: Router,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('AYUDA', viewContainerRef);
  }

  get audienciaActual(): AyudaAudience {
    return this.audiencias.find((a) => a.id === this.audience) ?? this.audiencias[0];
  }

  get preguntas(): PreguntaFrecuente[] {
    return this.audience === 'dueno' ? PREGUNTAS_DUENO : PREGUNTAS_CLIENTE;
  }

  get pasos(): PasoProceso[] {
    return this.audience === 'dueno' ? PASOS_DUENO : PASOS_CLIENTE;
  }

  get categorias(): string[] {
    return this.audience === 'dueno' ? CATEGORIAS_DUENO : CATEGORIAS_CLIENTE;
  }

  get whatsappUrl(): string {
    const mensaje = encodeURIComponent(MENSAJES_WHATSAPP[this.audience]);
    return `${this.contacto.whatsappUrl}?text=${mensaje}`;
  }

  get emailUrl(): string {
    const asunto = this.audience === 'dueno'
      ? 'Ayuda - Dueño de cancha'
      : 'Ayuda - Cliente';
    return `mailto:${this.contacto.email}?subject=${encodeURIComponent(asunto)}`;
  }

  get preguntasFiltradas(): PreguntaFrecuente[] {
    if (!this.categoriaSeleccionada) {
      return this.preguntas;
    }

    return this.preguntas.filter((p) => p.categoria === this.categoriaSeleccionada);
  }

  ngOnInit(): void {
    this.sincronizarAudience();

    // El footer enlaza a /ayuda#dueno: al cambiar el fragmento (misma ruta), re-aplicar audiencia
    this.subscriptions.push(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => this.sincronizarAudience())
    );

    this.seoService.updateTags({
      titulo: 'Centro de Ayuda y Preguntas Frecuentes | ReservaFast',
      descripcion: 'Preguntas frecuentes sobre reservas de canchas: cómo reservar, pagos en efectivo, cancelaciones y confirmación. Guía para jugadores y dueños de cancha.',
      url: '/ayuda',
      keywords: ['ayuda', 'soporte', 'preguntas frecuentes', 'cómo reservar cancha', 'cancelar reserva', 'pagar reserva', 'registrar cancha', 'panel proveedor']
    });

    // Ambas audiencias en el schema: el contenido está a un clic (toggle) y es indexable
    this.seoService.setAyudaJsonLd(
      [...PREGUNTAS_CLIENTE, ...PREGUNTAS_DUENO].map((p) => ({
        pregunta: p.pregunta,
        respuesta: p.respuesta
      }))
    );
  }

  onSeleccionarAudience(aud: Audiencia): void {
    if (this.audience === aud) return;
    this.audience = aud;
    this.categoriaSeleccionada = '';

    // replaceUrl: el toggle no debe llenar el historial (igual que el mockup)
    this.router.navigateByUrl(
      this.router.createUrlTree(['/ayuda'], { fragment: aud }),
      { replaceUrl: true }
    );
  }

  private sincronizarAudience(): void {
    const fragmento = this.router.url.split('#')[1];
    const aud: Audiencia = fragmento === 'dueno' ? 'dueno' : 'cliente';
    if (aud === this.audience) return;
    this.audience = aud;
    this.categoriaSeleccionada = '';
  }

  onSeleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = this.categoriaSeleccionada === categoria ? '' : categoria;
  }

  onLimpiarFiltros(): void {
    this.categoriaSeleccionada = '';
  }
}
