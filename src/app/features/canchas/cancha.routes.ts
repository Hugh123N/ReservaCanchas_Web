import { Routes } from "@angular/router";




export const canchaRoutes: Routes = [
    { path: 'canchas', loadComponent: () => import('./pages/canchas/canchas.component').then(m => m.CanchasComponent) },
    { path: 'mapa', loadComponent: () => import('./pages/mapa-canchas/mapa-canchas.component').then(m => m.MapaCanchasComponent) },
    { path: 'mapas-cancha', loadComponent: () => import('./pages/mapas/mapas.component').then(m => m.MapasComponent) },
    { path: ':id', loadComponent: () => import('./pages/detalle-cancha/detalle-cancha.component').then(m => m.DetalleCanchaComponent) },
    { path: "", redirectTo: "canchas", pathMatch: "full" }
];