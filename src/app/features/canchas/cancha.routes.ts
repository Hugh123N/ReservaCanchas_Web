import { Routes } from "@angular/router";
import { DetalleCanchaComponent } from "./pages/detalle-cancha/detalle-cancha.component";
import { CanchasComponent } from "./pages/canchas/canchas.component";


export const canchaRoutes: Routes = [
    { path: 'canchas', component: CanchasComponent },
    { path: ':id', component: DetalleCanchaComponent }
];