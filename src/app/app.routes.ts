import { Routes } from '@angular/router';
import { pagesRoutes } from '@base/pages/pages.routes';

import { canchaRoutes } from './features/canchas/cancha.routes';

export const routes: Routes = [
    { path: '', title: "Inicio", loadComponent: () => import('./features/home/pages/home/home.component').then(m => m.HomeComponent), pathMatch: 'full' },
    { path: 'cancha', loadChildren: () => import('./features/canchas/cancha.routes').then(m => m.canchaRoutes) },
    { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes) },
    { path: 'pago', loadChildren: () => import('./features/pago/pago.routes').then(m => m.pagoRoutes) },
    { path: 'mis-reservas', loadChildren: () => import('./features/mis-reservas/mis-reservas.routes').then(m => m.misReservasRoutes) },
    { path: 'perfil', loadChildren: () => import('./features/user-profile/user-profile.routes').then(m => m.userProfileRoutes) },
    ...pagesRoutes,
    { path: '**', redirectTo: '404' }
];
