import { Routes } from '@angular/router';
import { pagesRoutes } from '@base/pages/pages.routes';
import { HomeComponent } from './features/home/components/home/home.component';

export const routes: Routes = [
    { path: '', title: "Inicio",component: HomeComponent, pathMatch: 'full' },
    { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes) },
    ...pagesRoutes,
    { path: '**', redirectTo: '404' }
];
