import { Routes } from "@angular/router";




export const pagesRoutes: Routes = [
    {
        path: '401',
        loadComponent: () => import('./components/page401/page401.component').then(m => m.Page401Component),
        data: {
            title: 'Page 401'
        }
    },
    {
        path: '404',
        loadComponent: () => import('./components/page404/page404.component').then(m => m.Page404Component),
        data: {
            title: 'Page 404'
        }
    },
    {
        path: '500',
        loadComponent: () => import('./components/page500/page500.component').then(m => m.Page500Component),
        data: {
            title: 'Page 500'
        }
    },
];