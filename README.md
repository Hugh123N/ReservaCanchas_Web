# ReservaCanchasWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.13.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```
# Build del proyecto
npm run build

# Ejecutar SSR localmente
npm run serve:ssr:court-reservation-public


This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Configuración de la API en SSR

La API se configura con variables de entorno del proceso Node/contenedor al ejecutar
la aplicación. `environment*.ts` no define la URL utilizada por `BaseService`.

| Variable | Valor en producción |
|----------|---------------------|
| `API_URL` | `https://api.reservafast.com/api` |
| `MAPBOX_TOKEN` | Token público de Mapbox del entorno |

Ejemplo en PowerShell para desarrollo local:

```powershell
$env:API_URL = 'http://localhost:5108/api'
$env:MAPBOX_TOKEN = '<token-publico-mapbox>'
npm start
```

En producción, configurar esas variables en el contenedor y reconstruir/desplegar
la imagen después de cambiar el código. Si solo cambian las variables, basta con
reiniciar/recrear el proceso o contenedor con los nuevos valores.

El servidor SSR lee las variables directamente. El navegador obtiene los mismos
valores desde `/api/config` antes de iniciar la aplicación. Este endpoint usa
`Cache-Control: no-store` y su respuesta no se incluye en la caché HTTP de
hidratación de Angular (`transferCache: false`).

Las páginas se renderizan con `RenderMode.Server` para evitar que el build guarde
configuración de desarrollo en HTML prerenderizado. El build no necesita acceder
a la API. Si existía una versión anterior desplegada con prerender, invalidar la
caché HTML del proxy/CDN, si se utiliza, al publicar esta corrección.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
