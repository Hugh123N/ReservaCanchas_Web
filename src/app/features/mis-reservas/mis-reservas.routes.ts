import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/guards/auth.guard';

export const misReservasRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./components/lista-reservas/lista-reservas.component').then(
        (m) => m.ListaReservasComponent
      ),
    data: {
      title: 'Mis Reservas',
      breadcrumb: 'Mis Reservas'
    }
  }
];
