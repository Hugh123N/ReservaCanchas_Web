import { provideServerRendering, withRoutes } from '@angular/ssr';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { SERVER_APP_CONFIG } from './core/services/config.service';
import { getRuntimeConfig } from '../runtime-config.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: SERVER_APP_CONFIG, useFactory: getRuntimeConfig }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);

