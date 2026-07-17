import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { SeoConfig } from '../models/seo-config.model';

@Injectable({ providedIn: 'root' })
export class SeoService {

  private readonly BASE_URL = 'https://www.reservafast.com';

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  updateTags(config: SeoConfig): void {
    this.title.setTitle(config.titulo);

    this.meta.updateTag({ name: 'description', content: config.descripcion });

    if (config.keywords?.length) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords.join(', ') });
    }

    this.updateOpenGraph(config);
    this.updateCanonical(config.url);
  }

  private updateOpenGraph(config: SeoConfig): void {
    const ogTags = [
      { property: 'og:title', content: config.titulo },
      { property: 'og:description', content: config.descripcion },
      { property: 'og:url', content: `${this.BASE_URL}${config.url}` },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'ReservaFast' },
      { property: 'og:image', content: config.imagen || `${this.BASE_URL}/assets/images/og-default.jpg` }
    ];

    ogTags.forEach(tag => this.meta.updateTag(tag));
  }

  private updateCanonical(url: string): void {
    const canonical = this.document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `${this.BASE_URL}${url}`);
    } else {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', `${this.BASE_URL}${url}`);
      this.document.head.appendChild(link);
    }
  }

  setHome(): void {
    this.updateTags({
      titulo: 'ReservaFast - Reserva de Canchas de Fútbol, Pádel, Tenis y Más en Perú',
      descripcion: 'Encuentra y reserva canchas deportivas en Perú. Fútbol, pádel, tenis y más. Reserva online rápido y seguro.',
      url: '/',
      keywords: ['reserva de canchas', 'alquilar cancha', 'reservar cancha online', 'canchas deportivas Perú']
    });
  }

  setPlanes(): void {
    this.updateTags({
      titulo: 'Planes para Administrar Canchas Deportivas | ReservaFast',
      descripcion: 'Planes para administrar canchas deportivas. Software para gestionar reservas, pagos y clientes.',
      url: '/planes',
      keywords: ['planes software canchas', 'precio sistema reservas', 'administrar canchas deportivas']
    });
  }

  setCanchasSEO(ciudad: string | null, deporte: string | null): void {
    let titulo = 'ReservaFast - Reserva de Canchas Deportivas';
    let descripcion = 'Encuentra y reserva canchas de deportes en Perú.';
    let url = '/';

    if (ciudad && deporte) {
      titulo = `Canchas de ${deporte} en ${ciudad} | ReservaFast`;
      descripcion = `Reserva canchas de ${deporte} en ${ciudad}. Precios, horarios y disponibilidad.`;
      url = `/${this.normalize(ciudad)}/${this.normalize(deporte)}`;
    } else if (ciudad) {
      titulo = `Canchas en ${ciudad} | ReservaFast`;
      descripcion = `Encuentra canchas deportivas en ${ciudad}. Reserva online.`;
      url = `/${this.normalize(ciudad)}`;
    } else if (deporte) {
      titulo = `Canchas de ${deporte} en Perú | ReservaFast`;
      descripcion = `Encuentra canchas de ${deporte} en todo Perú. Reserva online.`;
      url = `/${this.normalize(deporte)}`;
    }

    this.updateTags({ titulo, descripcion, url });
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  addJsonLd(data: Record<string, any>, id?: string): void {
    const scriptId = id || `json-ld-${data['@type']}`;
    const existing = this.document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = scriptId;
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  setAyudaJsonLd(preguntas: Array<{ pregunta: string; respuesta: string }>): void {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: preguntas.map(p => ({
        '@type': 'Question',
        name: p.pregunta,
        acceptedAnswer: {
          '@type': 'Answer',
          text: p.respuesta
        }
      }))
    };

    this.addJsonLd(faqSchema, 'json-ld-faqpage');

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: this.BASE_URL
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Ayuda',
          item: `${this.BASE_URL}/ayuda`
        }
      ]
    };

    this.addJsonLd(breadcrumbSchema, 'json-ld-breadcrumblist');
  }
}
