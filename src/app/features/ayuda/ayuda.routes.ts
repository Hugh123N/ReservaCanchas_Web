import { Routes } from '@angular/router';

export const ayudaRoutes: Routes = [
  {
    path: '',
    title: 'Centro de Ayuda y Preguntas Frecuentes | ReservaFast',
    loadComponent: () =>
      import('./pages/ayuda-page/ayuda-page.component').then(
        (m) => m.AyudaPageComponent
      )
  }
];
