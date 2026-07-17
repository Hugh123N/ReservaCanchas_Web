# Plan de Implementación - SEO Dinámico ReservaFast

## Objetivo

Implementar URLs SEO-friendly para búsqueda de canchas por ciudad y deporte sin crear páginas Angular estáticas para cada combinación.

**URLs objetivo:**
```
/                      → Home principal
/lima                  → Canchas en Lima
/arequipa              → Canchas en Arequipa
/futbol                → Canchas de fútbol
/padel                 → Canchas de pádel
/lima/futbol           → Canchas de fútbol en Lima
/arequipa/padel        → Canchas de pádel en Arequipa
```

---

## Fase 1: Infraestructura de Catálogos con Slugs

### 1.1 Modificar Backend - Agregar campo `slug` a catálogos

**TipoDeporte** (nuevo campo):
```csharp
public class TipoDeporte
{
    public int IdTipoDeporte { get; set; }
    public string Codigo { get; set; }    // "FUTBOL", "PADEL", "TENIS"
    public string Nombre { get; set; }    // "Fútbol", "Pádel", "Tenis"
    public string Slug { get; set; }      // "futbol", "padel", "tenis" (nuevo)
}
```

**Ubigeo** (nuevo campo):
```csharp
public class Ubigeo
{
    public string CodigoUbigeo { get; set; }
    public string Departamento { get; set; }
    public string Provincia { get; set; }
    public string Distrito { get; set; }
    public string Slug { get; set; }      // "lima", "arequipa", "cusco" (nuevo)
}
```

### 1.2 Modificar DTOs del Backend

**TipoDeporteDto**:
```csharp
public class TipoDeporteDto
{
    public int IdTipoDeporte { get; set; }
    public string Codigo { get; set; }
    public string Nombre { get; set; }
    public string Slug { get; set; }
}
```

**UbigeoDto**:
```csharp
public class UbigeoDto
{
    public string CodigoUbigeo { get; set; }
    public string Departamento { get; set; }
    public string Provincia { get; set; }
    public string Distrito { get; set; }
    public string Slug { get; set; }
}
```

### 1.3 Agregar endpoint de búsqueda por slug

**TipoDeporteController**:
```csharp
[HttpGet("by-slug/{slug}")]
public async Task<IActionResult> GetBySlug(string slug)
{
    // Retorna TipoDeporteDto o null
}
```

**UbigeoController**:
```csharp
[HttpGet("by-slug/{slug}")]
public async Task<IActionResult> GetBySlug(string slug)
{
    // Retorna UbigeoDto o null (usando slug de provincia para ciudades principales)
}
```

---

## Fase 2: Servicios Angular

### 2.1 Actualizar modelos

**tipoDeporte.model.ts** (agregar slug):
```typescript
export interface TipoDeporte {
  codigo: string;
  nombre: string;
  slug: string;        // Nuevo
  descripcion?: string;
  icono?: string;
}
```

**ubigeo.model.ts** (agregar slug):
```typescript
export interface Ubigeo {
  codigoUbigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  slug: string;        // Nuevo
}
```

### 2.2 Crear servicio SEO

**Archivos a crear:**
```
src/app/features/seo/
├── core/
│   ├── services/
│   │   ├── seo.service.ts           # Gestión de meta tags
│   │   └── slug-resolver.service.ts # Resolución de slugs
│   └── models/
│       └── seo-config.model.ts      # Configuración SEO
├── pages/
│   └── canchas-seo/
│       ├── canchas-seo.component.ts
│       ├── canchas-seo.component.html
│       └── canchas-seo.component.css
└── seo.routes.ts
```

### 2.3 SlugResolverService

**Responsabilidad:** Resolver slugs a IDs usando catálogos cacheados.

```typescript
@Injectable({ providedIn: 'root' })
export class SlugResolverService {
  private ciudadesCache: Map<string, Ubigeo> = new Map();
  private deportesCache: Map<string, TipoDeporte> = new Map();
  private initialized = false;

  constructor(
    private ubigeoService: UbigeoService,
    private tipoDeporteService: TipoDeporteService
  ) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    const [ciudades, deportes] = await Promise.all([
      this.ubigeoService.listAll().toPromise(),
      this.tipoDeporteService.SelectCombo().toPromise()
    ]);

    // Construir cache de slugs de ciudades (usando provincia)
    ciudades.data?.forEach(u => {
      const slug = this.generateSlug(u.provincia);
      this.ciudadesCache.set(slug, u);
    });

    // Construir cache de slugs de deportes
    deportes.data?.forEach(d => {
      this.deportesCache.set(d.slug, d);
    });

    this.initialized = true;
  }

  resolver(parametro1: string, parametro2?: string): SeoResolution {
    const result: SeoResolution = {
      ciudad: null,
      deporte: null,
      esValido: false,
      urlCanonical: ''
    };

    if (!parametro1) return result;

    const p1Lower = this.normalize(parametro1);
    const esCiudad1 = this.ciudadesCache.has(p1Lower);
    const esDeporte1 = this.deportesCache.has(p1Lower);

    if (parametro2) {
      const p2Lower = this.normalize(parametro2);
      const esCiudad2 = this.ciudadesCache.has(p2Lower);
      const esDeporte2 = this.deportesCache.has(p2Lower);

      // Caso: /ciudad/deporte
      if (esCiudad1 && esDeporte2) {
        result.ciudad = this.ciudadesCache.get(p1Lower)!;
        result.deporte = this.deportesCache.get(p2Lower)!;
        result.esValido = true;
        result.urlCanonical = `/${p1Lower}/${p2Lower}`;
      }
      // Caso: /deporte/ciudad (invertido)
      else if (esDeporte1 && esCiudad2) {
        result.ciudad = this.ciudadesCache.get(p2Lower)!;
        result.deporte = this.deportesCache.get(p1Lower)!;
        result.esValido = true;
        result.urlCanonical = `/${p2Lower}/${p1Lower}`; // Canonical siempre ciudad/deporte
      }
    } else {
      // Caso: /ciudad
      if (esCiudad1) {
        result.ciudad = this.ciudadesCache.get(p1Lower)!;
        result.esValido = true;
        result.urlCanonical = `/${p1Lower}`;
      }
      // Caso: /deporte
      else if (esDeporte1) {
        result.deporte = this.deportesCache.get(p1Lower)!;
        result.esValido = true;
        result.urlCanonical = `/${p1Lower}`;
      }
    }

    return result;
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generateSlug(text: string): string {
    return this.normalize(text);
  }

  getCiudades(): Ubigeo[] {
    return Array.from(this.ciudadesCache.values());
  }

  getDeportes(): TipoDeporte[] {
    return Array.from(this.deportesCache.values());
  }
}
```

### 2.4 SeoService

**Responsabilidad:** Gestión de meta tags dinámicos.

```typescript
@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private title: Title,
    private meta: Meta,
    private og: OpenGraphService
  ) {}

  updateMetaForCanchas(resolution: SeoResolution): void {
    const { ciudad, deporte } = resolution;

    // Título dinámico
    let titulo = 'ReservaFast - Reserva de Canchas Deportivas';
    let descripcion = 'Encuentra y reserva canchas de deportes en Perú. Fútbol, pádel, tenis y más.';

    if (ciudad && deporte) {
      titulo = `Canchas de ${deporte.nombre} en ${ciudad.provincia} | ReservaFast`;
      descripcion = `Reserva canchas de ${deporte.nombre} en ${ciudad.provincia}. Precios, horarios y disponibilidad.`;
    } else if (ciudad) {
      titulo = `Canchas en ${ciudad.provincia} | ReservaFast`;
      descripcion = `Encuentra canchas deportivas en ${ciudad.provincia}. Reserva online.`;
    } else if (deporte) {
      titulo = `Canchas de ${deporte.nombre} en Perú | ReservaFast`;
      descripcion = `Encuentra canchas de ${deporte.nombre} en todo Perú. Reserva online.`;
    }

    this.title.setTitle(titulo);
    this.meta.updateTag({ name: 'description', content: descripcion });

    // Open Graph
    this.og.update({
      title: titulo,
      description: descripcion,
      url: `https://reservafast.com${resolution.urlCanonical}`,
      image: 'https://reservafast.com/assets/images/og-default.jpg'
    });

    // Canonical
    this.setCanonical(resolution.urlCanonical);
  }

  private setCanonical(url: string): void {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://reservafast.com${url}`);
    }
  }
}
```

---

## Fase 3: Rutas y Resolución

### 3.1 Nueva estructura de rutas

**app.routes.ts** (modificar):
```typescript
export const routes: Routes = [
  // Rutas existentes (mantener)
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes) },
  { path: 'pago', loadChildren: () => import('./features/pago/pago.routes').then(m => m.pagoRoutes) },
  { path: 'mis-reservas', loadChildren: () => import('./features/mis-reservas/mis-reservas.routes').then(m => m.misReservasRoutes) },
  { path: 'perfil', loadChildren: () => import('./features/user-profile/user-profile.routes').then(m => m.userProfileRoutes) },
  { path: 'planes', loadChildren: () => import('./features/planes/planes.routes').then(m => m.planesRoutes) },

  // Legacy redirect
  { path: 'cancha/canchas', redirectTo: '/canchas', pathMatch: 'full' },
  { path: 'cancha', loadChildren: () => import('./features/canchas/cancha.routes').then(m => m.canchaRoutes) },

  // NUEVAS RUTAS SEO
  {
    path: ':parametro1',
    loadChildren: () => import('./features/seo/seo.routes').then(m => m.seoRoutes)
  },
  {
    path: ':parametro1/:parametro2',
    loadChildren: () => import('./features/seo/seo.routes').then(m => m.seoRoutes)
  },

  // 404 al final
  ...pagesRoutes,
  { path: '**', redirectTo: '404' }
];
```

### 3.2 Rutas SEO

**seo.routes.ts**:
```typescript
import { Routes } from '@angular/router';

export const seoRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/canchas-seo/canchas-seo.component').then(m => m.CanchasSeoComponent)
  }
];
```

### 3.3 Componente CanchasSeoComponent

**canchas-seo.component.ts**:
```typescript
@Component({
  selector: 'app-canchas-seo',
  standalone: true,
  imports: [...],
  templateUrl: './canchas-seo.component.html',
  styleUrl: './canchas-seo.component.css'
})
export class CanchasSeoComponent extends BaseSearchComponent implements OnInit {
  
  resolution: SeoResolution | null = null;
  canchas: SearchCancha[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private slugResolver: SlugResolverService,
    private seoService: SeoService,
    private canchaService: CanchaService,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef
  ) {
    super('CANCHAS', viewContainerRef);
  }

  async ngOnInit(): Promise<void> {
    // Inicializar resolver con catálogos
    await this.slugResolver.initialize();

    // Obtener parámetros de ruta
    const p1 = this.route.snapshot.params['parametro1'];
    const p2 = this.route.snapshot.params['parametro2'];

    // Resolver slugs
    this.resolution = this.slugResolver.resolver(p1, p2);

    if (!this.resolution.esValido) {
      // Redirect a 404 si slug no existe
      this.router.navigate(['/404']);
      return;
    }

    // Canonical redirect (si la URL no es la canonical)
    const currentUrl = this.router.url;
    if (currentUrl !== this.resolution.urlCanonical) {
      this.router.navigate([this.resolution.urlCanonical]);
      return;
    }

    // Actualizar meta tags para SEO
    this.seoService.updateMetaForCanchas(this.resolution);

    // Cargar canchas con filtros
    this.loadCanchas();
  }

  private loadCanchas(): void {
    this.isLoading = true;
    
    const filter: SearchCanchaFilter = {};
    
    if (this.resolution?.ciudad) {
      filter.codigoUbigeo = this.resolution.ciudad.codigoUbigeo;
    }
    if (this.resolution?.deporte) {
      filter.idTipoDeporte = this.resolution.deporte.idTipoDeporte;
    }

    // Usar el servicio de canchas existente
    const params = this.buildSearchParams(filter);
    
    this.canchaService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.canchas = response.data.items;
          this.total = response.data.total;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
```

---

## Fase 4: Server-Side Rendering

### 4.1 Configurar server routes

**app.routes.server.ts** (modificar):
```typescript
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'cancha/:id',
    renderMode: RenderMode.Server
  },
  // NUEVAS RUTAS SEO - Prerender para SEO
  {
    path: ':parametro1',
    renderMode: RenderMode.Prerender
  },
  {
    path: ':parametro1/:parametro2',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
```

### 4.2 Generación de sitemap.xml

**Archivo a crear:** `src/app/features/seo/core/services/sitemap.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class SitemapService {
  constructor(
    private slugResolver: SlugResolverService,
    private canchaService: CanchaService
  ) {}

  async generateSitemap(): Promise<string> {
    const urls: string[] = [];
    const baseUrl = 'https://reservafast.com';

    // URLs estáticas
    urls.push(`${baseUrl}/`);
    urls.push(`${baseUrl}/planes`);
    urls.push(`${baseUrl}/para-proveedores`);

    // URLs de ciudades
    const ciudades = this.slugResolver.getCiudades();
    ciudades.forEach(c => {
      urls.push(`${baseUrl}/${c.slug}`);
    });

    // URLs de deportes
    const deportes = this.slugResolver.getDeportes();
    deportes.forEach(d => {
      urls.push(`${baseUrl}/${d.slug}`);
    });

    // Combinaciones ciudad/deporte
    ciudades.forEach(c => {
      deportes.forEach(d => {
        urls.push(`${baseUrl}/${c.slug}/${d.slug}`);
      });
    });

    // URLs de canchas individuales
    const canchas = await this.getAllCanchas();
    canchas.forEach(cancha => {
      const slug = this.generateCanchaSlug(cancha.nombre);
      urls.push(`${baseUrl}/cancha/${slug}`);
    });

    return this.buildSitemapXml(urls);
  }

  private buildSitemapXml(urls: string[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    urls.forEach(url => {
      xml += '  <url>\n';
      xml += `    <loc>${url}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  }
}
```

### 4.3 Endpoint de sitemap

**Opción A:** Endpoint en backend que genera el sitemap
**Opción B:** Archivo estático generado en build

---

## Fase 5: Redirects y Canonicals

### 5.1 Redirects en nginx.conf

```nginx
# Redirect legacy URLs
location /cancha/canchas {
    return 301 /canchas;
}

# Redirect canonical (ciudad/deporte siempre primero)
location ~ ^/(futbol|padel|tenis|voleibol)/([\w-]+)$ {
    return 301 /$2/$1;
}
```

### 5.2 Canonical tags

Cada página debe incluir:
```html
<link rel="canonical" href="https://reservafast.com/lima/futbol" />
```

---

## Fase 6: Testing

### 6.1 Pruebas de resolución

```typescript
describe('SlugResolverService', () => {
  it('debe resolver /lima como ciudad', () => {
    const result = service.resolver('lima');
    expect(result.ciudad?.provincia).toBe('Lima');
    expect(result.deporte).toBeNull();
  });

  it('debe resolver /futbol como deporte', () => {
    const result = service.resolver('futbol');
    expect(result.ciudad).toBeNull();
    expect(result.deporte?.codigo).toBe('FUTBOL');
  });

  it('debe resolver /lima/futbol correctamente', () => {
    const result = service.resolver('lima', 'futbol');
    expect(result.ciudad?.provincia).toBe('Lima');
    expect(result.deporte?.codigo).toBe('FUTBOL');
  });

  it('debe retornar esValido=false para slug inexistente', () => {
    const result = service.resolver('xyz123');
    expect(result.esValido).toBeFalse();
  });
});
```

### 6.2 Pruebas de SEO

```typescript
describe('SeoService', () => {
  it('debe actualizar title correctamente', () => {
    service.updateMetaForCanchas({
      ciudad: { provincia: 'Lima', ... },
      deporte: { nombre: 'Fútbol', ... }
    });
    expect(titleService.getTitle()).toBe('Canchas de Fútbol en Lima | ReservaFast');
  });
});
```

---

## Resumen de Archivos a Crear/Modificar

### Nuevos:
```
src/app/features/seo/
├── core/
│   ├── services/
│   │   ├── seo.service.ts
│   │   ├── slug-resolver.service.ts
│   │   └── sitemap.service.ts
│   └── models/
│       └── seo-config.model.ts
├── pages/
│   └── canchas-seo/
│       ├── canchas-seo.component.ts
│       ├── canchas-seo.component.html
│       └── canchas-seo.component.css
└── seo.routes.ts
```

### Modificados:
```
src/app/app.routes.ts           # Agregar rutas SEO
src/app/app.routes.server.ts    # Configurar SSR
src/app/features/cancha-tipo/core/model/tipoDeporte.model.ts  # Agregar slug
src/app/features/canchas/core/model/ubigeo/ubigeo.model.ts    # Agregar slug
```

### Backend:
```
TipoDeporte.cs       # Agregar campo Slug
Ubigeo.cs            # Agregar campo Slug
TipoDeporteController.cs  # Agregar endpoint by-slug
UbigeoController.cs       # Agregar endpoint by-slug
```

---

## Orden de Implementación

1. **Backend:** Agregar campos `slug` a tablas y DTOs
2. **Backend:** Crear endpoints `by-slug`
3. **Frontend:** Actualizar modelos con campo `slug`
4. **Frontend:** Crear `SlugResolverService`
5. **Frontend:** Crear `SeoService`
6. **Frontend:** Crear componente `CanchasSeoComponent`
7. **Frontend:** Configurar rutas en `app.routes.ts`
8. **Frontend:** Configurar SSR en `app.routes.server.ts`
9. **Frontend:** Implementar redirects en nginx
10. **Testing:** Pruebas de resolución y SEO

---

## Notas Importantes

1. **Cache de catálogos:** El `SlugResolverService` debe cachear los catálogos para evitar HTTP requests en cada navegación
2. **Canonical siempre es `ciudad/deporte`** aunque la URL sea `/deporte/ciudad`
3. **Redirect automático** si la URL no coincide con el canonical
4. **SSR prerender** para que Googlebot indexe las páginas correctamente
5. **Sitemap dinámico** que se actualice cuando se agreguen ciudades o deportes

---

## Fase 7: Pre-Producción y Google Indexing

### 7.1 Verificar SSR Localmente

```bash
# Build del proyecto
npm run build

# Ejecutar SSR localmente
npm run serve:ssr:court-reservation-public

# Verificar que los meta tags aparecen en el HTML
curl http://localhost:4000/ | grep "<title>"
curl http://localhost:4000/ | grep "og:title"
curl http://localhost:4000/ | grep "canonical"
```

### 7.2 Crear robots.txt

**Archivo a crear:** `src/robots.txt`

```
User-agent: *
Allow: /

# Páginas privadas - no indexar
Disallow: /auth/
Disallow: /mis-reservas/
Disallow: /perfil/
Disallow: /pago/

# Sitemap
Sitemap: https://reservafast.com/sitemap.xml
```

**Configurar en angular.json:**
```json
{
  "projects": {
    "court-reservation-public": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              "src/favicon.ico",
              "src/assets",
              "src/robots.txt"
            ]
          }
        }
      }
    }
  }
}
```

### 7.3 Configurar Google Search Console

1. Ir a https://search.google.com/search-console
2. Agregar propiedad: `https://reservafast.com`
3. Verificar ownership:
   - **Opción A:** Agregar meta tag en `<head>` (recomendado)
   - **Opción B:** Subir archivo HTML de verificación
   - **Opción C:** Verificar vía DNS (TXT record)

4. Enviar sitemap.xml:
   ```
   https://reservafast.com/sitemap.xml
   ```

### 7.4 Meta Tags Verificación Final

**Verificar que cada página tiene:**
```html
<title>ReservaFast - Reserva de Canchas Deportivas</title>
<meta name="description" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="https://reservafast.com/...">
<link rel="canonical" href="https://reservafast.com/..." />
```

### 7.5 Configurar nginx.conf

```nginx
server {
    listen 80;
    server_name reservafast.com www.reservafast.com;

    # Redirect a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name reservafast.com www.reservafast.com;

    # SSL config
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Angular SSR
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Redirect legacy URLs
    location /cancha/canchas {
        return 301 /canchas;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # robots.txt
    location = /robots.txt {
        alias /path/to/robots.txt;
        add_header Content-Type text/plain;
    }

    # sitemap.xml
    location = /sitemap.xml {
        alias /path/to/sitemap.xml;
        add_header Content-Type application/xml;
    }
}
```

### 7.6 Build y Deploy

```bash
# 1. Build producción
npm run build

# 2. Copiar archivos estáticos al servidor
scp dist/court-reservation-public/browser/* user@server:/var/www/reservafast/

# 3. Copiar build SSR
scp dist/court-reservation-public/server/* user@server:/var/www/reservafast/server/

# 4. Instalar dependencias en servidor
ssh user@server
cd /var/www/reservafast
npm install --production

# 5. Reiniciar servidor
pm2 restart reservafast
```

### 7.7 Verificación Post-Deploy

```bash
# 1. Verificar que el sitio responde
curl -I https://reservafast.com

# 2. Verificar meta tags
curl https://reservafast.com/ | grep "<title>"

# 3. Verificar robots.txt
curl https://reservafast.com/robots.txt

# 4. Verificar sitemap
curl https://reservafast.com/sitemap.xml

# 5. Test Googlebot (Google Search Console)
# Usar herramienta "Inspección de URL"
```

### 7.8 Google Search Console - Pasos Finales

1. **Inspeccionar URLs:**
   - Buscar cada URL importante
   - Verificar que Google puede renderizar la página
   - Verificar que los meta tags son correctos

2. **Solicitar Indexación:**
   - Seleccionar "Solicitar indexación"
   - Esperar 24-48 horas

3. **Monitorear:**
   - Revisar "Rendimiento" semanalmente
   - Verificar que las páginas aparecen en búsquedas
   - Monitorear errores de cobertura

---

## Checklist Pre-Producción

```
[ ] SSR build funciona correctamente
[ ] robots.txt accessible en /robots.txt
[ ] sitemap.xml accessible en /sitemap.xml
[ ] Google Search Console configurado
[ ] Canonical tags funcionando
[ ] Open Graph tags funcionando
[ ] Sin errores de console en SSR
[ ] nginx.conf configurado
[ ] SSL/HTTPS habilitado
[ ] Redirects de URLs legacy funcionando
[ ] Meta tags únicos para cada página
[ ] Imágenes OG configuradas
```

---

## Orden Final de Implementación

| Paso | Descripción | Estado |
|------|-------------|--------|
| 1 | Backend: Agregar campos `slug` a tablas y DTOs | ⬜ |
| 2 | Backend: Crear endpoints `by-slug` | ⬜ |
| 3 | Frontend: Actualizar modelos con campo `slug` | ⬜ |
| 4 | Frontend: Crear `SlugResolverService` | ✅ |
| 5 | Frontend: Crear `SeoService` | ✅ |
| 6 | Frontend: Crear componente `CanchasSeoComponent` | ✅ |
| 7 | Frontend: Configurar rutas en `app.routes.ts` | ⬜ |
| 8 | Frontend: Configurar SSR en `app.routes.server.ts` | ⬜ |
| 9 | Frontend: Crear robots.txt | ⬜ |
| 10 | Frontend: Configurar nginx.conf | ⬜ |
| 11 | Testing: Pruebas de resolución y SEO | ⬜ |
| 12 | Deploy: Build producción y subir a servidor | ⬜ |
| 13 | Google Search Console: Configurar y verificar | ⬜ |
| 14 | Google Search Console: Enviar sitemap | ⬜ |
| 15 | Google Search Console: Solicitar indexación | ⬜ |





# 1. Build
npm run build
# 2. Copiar robots.txt al servidor
scp src/robots.txt user@server:/var/www/reservafast/
# 3. Copiar nginx.conf
scp nginx.conf user@server:/etc/nginx/sites-available/reservafast
sudo ln -s /etc/nginx/sites-available/reservafast /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
# 4. Iniciar SSR
pm2 start dist/court-reservation-public/server/server.mjs --name reservafast