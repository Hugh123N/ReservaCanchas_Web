import { Routes } from "@angular/router";




export const canchaRoutes: Routes = [
    { path: 'canchas', loadComponent: () => import('./pages/canchas/canchas.component').then(m => m.CanchasComponent) },
    { path: ':id', loadComponent: () => import('./pages/detalle-cancha/detalle-cancha.component').then(m => m.DetalleCanchaComponent) }
];