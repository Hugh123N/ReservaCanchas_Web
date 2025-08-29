import { Routes } from '@angular/router';
import { pagesRoutes } from '@base/pages/pages.routes';

export const routes: Routes = [
    { path: '', loadChildren: () => import('./features/home/home.routes').then(m => m.homeRoutes) },
    { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes) },
    ...pagesRoutes,
    { path: '**', redirectTo: '404' }
];
