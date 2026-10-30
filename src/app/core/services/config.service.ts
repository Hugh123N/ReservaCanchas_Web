import { Injectable, InjectionToken, REQUEST, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiUrl: string;
  mapboxToken: string;
}

export const SERVER_APP_CONFIG = new InjectionToken<AppConfig>('SERVER_APP_CONFIG');

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config?: AppConfig;
  private readonly serverConfig = inject(SERVER_APP_CONFIG, { optional: true });
  private readonly request = inject(REQUEST, { optional: true });

  constructor(private http: HttpClient) {}

  async load(): Promise<void> {
    // Angular también inicializa la app al descubrir rutas durante el build, sin una petición SSR.
    if (this.serverConfig && !this.request) return;

    const config = this.serverConfig ?? await firstValueFrom(
      // La configuración del contenedor no debe reutilizarse desde el HTML de otro entorno.
      this.http.get<AppConfig>('/api/config', { transferCache: false })
    );

    const apiUrl = config.apiUrl?.trim().replace(/\/+$/, '');
    if (!apiUrl || !URL.canParse(apiUrl) || !/^https?:$/.test(new URL(apiUrl).protocol)) {
      throw new Error('API_URL debe ser una URL absoluta HTTP(S), incluyendo /api.');
    }

    this.config = { ...config, apiUrl };
  }

  get apiUrl(): string {
    if (!this.config) throw new Error('La configuración de la API aún no se ha cargado.');
    return this.config.apiUrl;
  }

  get mapboxToken(): string {
    return this.config?.mapboxToken ?? '';
  }
}
