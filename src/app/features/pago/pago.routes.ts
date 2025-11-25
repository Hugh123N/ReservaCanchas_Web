import { Routes } from "@angular/router";



export const pagoRoutes: Routes = [
    { path: '', title: "Pago", loadComponent: () => import('./components/payment/payment.component').then(m => m.PaymentComponent) }
];