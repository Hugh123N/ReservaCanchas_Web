import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/guards/auth.guard';

export const userProfileRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
  }
];
