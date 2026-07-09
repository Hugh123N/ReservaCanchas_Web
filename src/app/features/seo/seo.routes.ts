import { Routes } from "@angular/router";

export const seoRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/canchas-seo/canchas-seo.component').then(m => m.CanchasSeoComponent)
  }
];
