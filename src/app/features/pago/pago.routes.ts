import { Routes } from "@angular/router";



export const pagoRoutes: Routes = [
    { path: '', loadComponent: () => import('./components/payment/payment.component').then(m => m.PaymentComponent) }
];