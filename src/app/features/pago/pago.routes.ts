import { Routes } from "@angular/router";
import { AuthGuard } from '@core/auth/guards/auth.guard';

export const pagoRoutes: Routes = [
    {
        path: '',
        title: "Pago",
        canActivate: [AuthGuard],
        loadComponent: () => import('./components/payment/payment.component').then(m => m.PaymentComponent)
    }
];