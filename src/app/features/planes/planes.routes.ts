import { Routes } from "@angular/router";

export const planesRoutes: Routes = [
  {
    path: '',
    title: 'Planes',
    loadComponent: () => import('./pages/planes-catalogo/planes-catalogo.component').then(m => m.PlanesCatalogoComponent)
  }
];
