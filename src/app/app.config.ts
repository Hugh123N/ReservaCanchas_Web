import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from '@core/auth/interceptor/token.interceptor.functional';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';
import { provideSpinnerConfig } from 'ngx-spinner';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(CommonModule, FormsModule),

    // Configuración global de ngx-spinner
    provideSpinnerConfig({ type: 'ball-spin-fade' }),

    // Interceptors funcionales (Angular 20+)
    // Orden: loadingInterceptor primero para mostrar loading, luego tokenInterceptor para auth
    provideHttpClient(
      withInterceptors([loadingInterceptor, tokenInterceptor])
    )
  ]
};
