import { ApplicationConfig, importProvidersFrom, provideAppInitializer, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from '@core/auth/interceptor/token.interceptor.functional';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';
import { ConfigService } from '@core/services/config.service';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(CommonModule, FormsModule),
    provideHttpClient(
      withFetch(),
      withInterceptors([loadingInterceptor, tokenInterceptor])
    ),
    provideAppInitializer(() => {
      const configService = inject(ConfigService);
      return configService.load();
    }),
  ]
};
