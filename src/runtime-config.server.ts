import type { AppConfig } from './app/core/services/config.service';

export function getRuntimeConfig(): AppConfig {
  return {
    apiUrl: process.env['API_URL'] ?? '',
    mapboxToken: process.env['MAPBOX_TOKEN'] ?? '',
  };
}
