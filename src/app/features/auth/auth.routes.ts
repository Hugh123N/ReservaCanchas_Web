import { Routes } from "@angular/router";



export const authRoutes: Routes = [
    { path: 'login',  title: "Login", loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', title: "Register", loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
    { path: 'forgot-password', title: "Forgot Password", loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
    { path: 'reset-password', title: "Reset Password", loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
    { path: "", redirectTo: "login", pathMatch: "full" }
];