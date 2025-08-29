import { Routes } from "@angular/router";
import { Page401Component } from "./components/page401/page401.component";
import { Page404Component } from "./components/page404/page404.component";
import { Page500Component } from "./components/page500/page500.component";

export const pagesRoutes: Routes = [
    {
        path: '401',
        component: Page401Component,
        data: {
            title: 'Page 401'
        }
    },
    {
        path: '404',
        component: Page404Component,
        data: {
            title: 'Page 404'
        }
    },
    {
        path: '500',
        component: Page500Component,
        data: {
            title: 'Page 500'
        }
    },
];