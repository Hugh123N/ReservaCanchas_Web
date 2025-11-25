import { Routes } from "@angular/router";




export const canchaRoutes: Routes = [
    { path: 'canchas', title: "Canchas", loadComponent: () => import('./pages/canchas/canchas.component').then(m => m.CanchasComponent) },
    { path: 'mapa', title: "Mapa", loadComponent: () => import('./pages/mapa-canchas/mapa-canchas.component').then(m => m.MapaCanchasComponent) },
    { path: ':id', title: "Detalle Cancha", loadComponent: () => import('./pages/detalle-cancha/detalle-cancha.component').then(m => m.DetalleCanchaComponent) },
    { path: "", redirectTo: "canchas", pathMatch: "full" }
];