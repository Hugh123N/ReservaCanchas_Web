import { Routes } from '@angular/router';
import { pagesRoutes } from '@base/pages/pages.routes';

export const routes: Routes = [
    // Rutas principales
    { path: '', title: "Inicio", loadComponent: () => import('./features/home/pages/home/home.component').then(m => m.HomeComponent), pathMatch: 'full' },
    { path: 'planes', loadChildren: () => import('./features/planes/planes.routes').then(m => m.planesRoutes) },

    // Rutas de funcionalidad
    { path: 'cancha', loadChildren: () => import('./features/canchas/cancha.routes').then(m => m.canchaRoutes) },
    { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes) },
    { path: 'pago', loadChildren: () => import('./features/pago/pago.routes').then(m => m.pagoRoutes) },
    { path: 'mis-reservas', loadChildren: () => import('./features/mis-reservas/mis-reservas.routes').then(m => m.misReservasRoutes) },
    { path: 'perfil', loadChildren: () => import('./features/user-profile/user-profile.routes').then(m => m.userProfileRoutes) },

    // Legacy redirects
    { path: 'cancha/canchas', redirectTo: '/canchas', pathMatch: 'full' },

    // Rutas SEO dinámicas (ciudad/deporte)
    { path: ':parametro1', loadChildren: () => import('./features/seo/seo.routes').then(m => m.seoRoutes) },
    { path: ':parametro1/:parametro2', loadChildren: () => import('./features/seo/seo.routes').then(m => m.seoRoutes) },

    // Rutas estáticas y 404
    ...pagesRoutes,
    { path: '**', redirectTo: '404' }
];
