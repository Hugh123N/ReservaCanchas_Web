import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas que requieren renderizado dinámico (auth, sesión)
  {
    path: 'auth',
    renderMode: RenderMode.Server
  },
  {
    path: 'mis-reservas',
    renderMode: RenderMode.Server
  },
  {
    path: 'perfil',
    renderMode: RenderMode.Server
  },
  {
    path: 'pago',
    renderMode: RenderMode.Server
  },

  // Detalle de cancha (SEO + dinámico)
  {
    path: 'cancha/:id',
    renderMode: RenderMode.Server
  },

  // Estas páginas consultan la API y deben usar las variables del contenedor en ejecución.
  {
    path: '',
    renderMode: RenderMode.Server
  },
  {
    path: 'planes',
    renderMode: RenderMode.Server
  },
  {
    path: 'ayuda',
    renderMode: RenderMode.Server
  },

  // Rutas SEO dinámicas - Server para resolver slugs
  {
    path: ':parametro1',
    renderMode: RenderMode.Server
  },
  {
    path: ':parametro1/:parametro2',
    renderMode: RenderMode.Server
  },

  // Evita fijar configuración de build en el estado de hidratación de otras páginas.
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
