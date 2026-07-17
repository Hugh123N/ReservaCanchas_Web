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

  // Rutas estáticas - Prerender
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'planes',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'ayuda',
    renderMode: RenderMode.Prerender
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

  // Rutas estáticas - Prerender
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'planes',
    renderMode: RenderMode.Prerender
  },

  // Todo lo demás - Prerender
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
