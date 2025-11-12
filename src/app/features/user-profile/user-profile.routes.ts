import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/guards/auth.guard';

export const userProfileRoutes: Routes = [
  {
    path: '',
    //canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
      },
      {
        path: 'editar',
        loadComponent: () =>
          import('./pages/editar-perfil/editar-perfil.component').then(m => m.EditarPerfilComponent),
      }
    ]
  }
];
