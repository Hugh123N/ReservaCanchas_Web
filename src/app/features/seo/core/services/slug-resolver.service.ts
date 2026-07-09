import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UbigeoService } from '../../../canchas/core/services/ubigeo.service';
import { TipoDeporteService } from '../../../cancha-tipo/core/services/tipo-deporte.service';
import { SeoResolution } from '../models/seo-config.model';

@Injectable({ providedIn: 'root' })
export class SlugResolverService {

  private ciudadesCache: Map<string, any> = new Map();
  private deportesCache: Map<string, any> = new Map();
  private initialized = false;

  constructor(
    private ubigeoService: UbigeoService,
    private tipoDeporteService: TipoDeporteService
  ) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const [ciudades, deportes] = await Promise.all([
        firstValueFrom(this.ubigeoService.listAll()),
        firstValueFrom(this.tipoDeporteService.SelectCombo())
      ]);

      if (ciudades.isValid) {
        ciudades.data?.forEach((u: any) => {
          const slug = this.normalize(u.provincia);
          this.ciudadesCache.set(slug, u);
        });
      }

      if (deportes.isValid) {
        deportes.data?.forEach((d: any) => {
          const slug = d.slug || this.normalize(d.nombre);
          this.deportesCache.set(slug, d);
        });
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing slug resolver:', error);
    }
  }

  resolver(parametro1: string, parametro2?: string): SeoResolution {
    const result: SeoResolution = {
      ciudad: null,
      deporte: null,
      esValido: false,
      urlCanonical: ''
    };

    if (!parametro1) return result;

    const p1Lower = this.normalize(parametro1);
    const esCiudad1 = this.ciudadesCache.has(p1Lower);
    const esDeporte1 = this.deportesCache.has(p1Lower);

    if (parametro2) {
      const p2Lower = this.normalize(parametro2);
      const esCiudad2 = this.ciudadesCache.has(p2Lower);
      const esDeporte2 = this.deportesCache.has(p2Lower);

      if (esCiudad1 && esDeporte2) {
        result.ciudad = this.ciudadesCache.get(p1Lower);
        result.deporte = this.deportesCache.get(p2Lower);
        result.esValido = true;
        result.urlCanonical = `/${p1Lower}/${p2Lower}`;
      } else if (esDeporte1 && esCiudad2) {
        result.ciudad = this.ciudadesCache.get(p2Lower);
        result.deporte = this.deportesCache.get(p1Lower);
        result.esValido = true;
        result.urlCanonical = `/${p2Lower}/${p1Lower}`;
      }
    } else {
      if (esCiudad1) {
        result.ciudad = this.ciudadesCache.get(p1Lower);
        result.esValido = true;
        result.urlCanonical = `/${p1Lower}`;
      } else if (esDeporte1) {
        result.deporte = this.deportesCache.get(p1Lower);
        result.esValido = true;
        result.urlCanonical = `/${p1Lower}`;
      }
    }

    return result;
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

  getCiudades(): any[] {
    return Array.from(this.ciudadesCache.values());
  }

  getDeportes(): any[] {
    return Array.from(this.deportesCache.values());
  }
}
