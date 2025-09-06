import { Routes } from '@angular/router';
import { pagesRoutes } from '@base/pages/pages.routes';
import { HomeComponent } from './features/home/components/home/home.component';
import { canchaRoutes } from './features/canchas/cancha.routes';

export const routes: Routes = [
    { path: '', title: "Inicio",component: HomeComponent, pathMatch: 'full' },
    { path: 'cancha', loadChildren: () => import('./features/canchas/cancha.routes').then(m => m.canchaRoutes) },
    { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes) },
    ...pagesRoutes,
    { path: '**', redirectTo: '404' }
];
