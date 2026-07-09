import { Injectable } from '@angular/core';
import { SitemapUrl } from '../models/seo-config.model';

@Injectable({ providedIn: 'root' })
export class SitemapService {

  private readonly BASE_URL = 'https://reservafast.com';

  generateStaticUrls(): SitemapUrl[] {
    return [
      { loc: '/', changefreq: 'daily', priority: 1.0 },
      { loc: '/planes', changefreq: 'weekly', priority: 0.8 },
      { loc: '/para-proveedores', changefreq: 'monthly', priority: 0.7 },
      { loc: '/beneficios', changefreq: 'monthly', priority: 0.6 },
      { loc: '/blog', changefreq: 'weekly', priority: 0.7 }
    ];
  }

  generateCityUrls(ciudades: { slug: string }[]): SitemapUrl[] {
    return ciudades.map(c => ({
      loc: `/${c.slug}`,
      changefreq: 'weekly' as const,
      priority: 0.8
    }));
  }

  generateSportUrls(deportes: { slug: string }[]): SitemapUrl[] {
    return deportes.map(d => ({
      loc: `/${d.slug}`,
      changefreq: 'weekly' as const,
      priority: 0.8
    }));
  }

  generateCombinationUrls(ciudades: { slug: string }[], deportes: { slug: string }[]): SitemapUrl[] {
    const urls: SitemapUrl[] = [];
    ciudades.forEach(c => {
      deportes.forEach(d => {
        urls.push({
          loc: `/${c.slug}/${d.slug}`,
          changefreq: 'weekly',
          priority: 0.9
        });
      });
    });
    return urls;
  }

  generateCanchaUrls(canchas: { idCancha: number; nombre: string }[]): SitemapUrl[] {
    return canchas.map(c => ({
      loc: `/cancha/${this.generateSlug(c.nombre)}`,
      changefreq: 'daily',
      priority: 0.9
    }));
  }

  buildSitemapXml(urls: SitemapUrl[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach(url => {
      xml += '  <url>\n';
      xml += `    <loc>${this.BASE_URL}${url.loc}</loc>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
