# Flujos y Procesos de Negocio - ReservaCanchas Web

## Índice

1. [Flujo de Autenticación](#1-flujo-de-autenticación)
2. [Flujo de Búsqueda de Canchas](#2-flujo-de-búsqueda-de-canchas)
3. [Flujo de Reserva](#3-flujo-de-reserva)
4. [Flujo de Pago](#4-flujo-de-pago)
5. [Flujo de "Mis Reservas"](#5-flujo-de-mis-reservas)
6. [Flujo de Favoritos](#6-flujo-de-favoritos)
7. [Entidades del Dominio](#7-entidades-del-dominio)
8. [Catálogos del Sistema](#8-catálogos-del-sistema)

---

## 1. Flujo de Autenticación

### 1.1 Login Tradicional

```
┌─────────────────┐
│  LoginComponent  │
│  (email + pass)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  POST /Usuario/login                        │
│  { applicationCode: 'Cliente',              │
│    userName: email,                         │
│    password: password }                     │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Backend retorna ResponseDto<LoginResultModel>│
│  { accessToken: { access_token, expires_in } }│
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  AuthService.logIn(accessToken)             │
│  ├── Guarda token en localStorage           │
│  │   ['access_token_${appCode}']            │
│  ├── Decodifica JWT (jwtDecode)             │
│  │   └── Extrae: UserId, email, UserName,   │
│  │       DisplayName, Telefono, Roles       │
│  ├── Emite User via Subject<User>           │
│  └── Carga favoritos (dynamic import)       │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Navegación post-login                      │
│  ├── Si existe redirect_after_login         │
│  │   └── Navega a URL guardada              │
│  └── Si no existe                           │
│      └── Navega a '/'                       │
└─────────────────────────────────────────────┘
```

### 1.2 Login OAuth (Google / Facebook)

```
┌──────────────────┐
│  LoginComponent   │
│  Click "Google"   │
│  o "Facebook"     │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  OAuthHandlerService.handleLogin(provider)  │
│  └── OAuthRegistryService.getStrategy()    │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Estrategia (Google/FacebookOAuthStrategy)  │
│  ├── initialize() - Inicializa SDK         │
│  └── login() - Retorna token del proveedor │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  POST /Usuario/client/loginAndCreate        │
│  { provider, token }                       │
│  └── Backend crea usuario si no existe     │
│      y retorna JWT                         │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Mismo flujo que login tradicional          │
│  (guardar token, decodificar, navegar)     │
└─────────────────────────────────────────────┘
```

### 1.3 Registro

```
┌──────────────────┐
│  RegisterComponent│
│  Formulario:      │
│  - firstName      │
│  - lastName       │
│  - userName       │
│  - email          │
│  - phoneNumber    │
│  - password       │
│  - confirmPassword│
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Validaciones del formulario:               │
│  ├── Password: min 6, alfanumérico          │
│  │   (?=.*[A-Za-z])(?=.*\d)                │
│  ├── Confirmación: passwordMatchValidator   │
│  └── Teléfono peruano: ^(\+51|51)?[9]...   │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  POST /Usuario/register/cliente             │
│  CreateUserModel {                          │
│    username, firstName, lastName,           │
│    phoneNumber, email, password,            │
│    confirmPassword                          │
│  }                                         │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Backend crea usuario y retorna JWT         │
│  └── Auto-login después del registro       │
└─────────────────────────────────────────────┘
```

### 1.4 Forgot / Reset Password

```
┌────────────────────────┐
│  ForgotPasswordComponent│
│  Ingreso: email         │
└────────┬───────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  POST /Usuario/forgot-password/{email}/{host}│
│  └── Backend envía email con link:          │
│      {host}/auth/reset-password?            │
│      email={email}&token={token}            │
└────────────────────────────────────────────┘

         ... usuario hace click en link ...

┌─────────────────────────────────────────────┐
│  ResetPasswordComponent                     │
│  Query params: email, token                 │
│  Formulario: password, confirmPassword      │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  POST /Usuario/reset-password               │
│  ResetPasswordModel {                       │
│    email, code: token,                      │
│    password, confirmPassword                │
│  }                                         │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Contraseña actualizada                     │
│  └── Redirige a /auth/login                │
└─────────────────────────────────────────────┘
```

---

## 2. Flujo de Búsqueda de Canchas

### 2.1 Búsqueda desde Home

```
┌──────────────────┐
│  HomeComponent    │
│  SearchBarComponent│
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Carga inicial:                             │
│  ├── TipoDeporteService.SelectCombo()      │
│  │   └── GET /TipoDeporte/SelectCombo      │
│  └── UbigeoService.listAll()               │
│      └── GET /Ubigeo/listAll               │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Usuario selecciona filtros:                │
│  ├── Tipo de deporte (select)              │
│  ├── Ciudad / Distrito (autocomplete)      │
│  ├── Fecha (datepicker custom)             │
│  └── Hora (select)                         │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Navegación a resultados:                   │
│  /cancha/canchas?                           │
│    deporte={idTipoDeporte}                  │
│    &ubicacion={codigoUbigeo}                │
│    &fecha={fecha}                           │
│    &hora={hora}                             │
└─────────────────────────────────────────────┘
```

### 2.2 Búsqueda con Filtros

```
┌──────────────────┐
│  CanchasComponent │
│  (recibe query    │
│   params)         │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  CanchaService.search(filter)               │
│  └── POST /Cancha/search                    │
│      SearchCanchaFilter {                   │
│        nombre, códigoUbigeo,                │
│        idTipoDeporte, fecha, hora,          │
│        idEstadoCancha,                      │
│        area: { norte, sur, este, oeste },   │
│        idUsuario, soloFavoritos             │
│      }                                     │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Backend retorna QueryResultsModel:         │
│  {                                         │
│    items: SearchCancha[],                   │
│    total: number,                           │
│    page: number,                            │
│    pageSize: number                         │
│  }                                         │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Renderizado:                               │
│  ├── Cards de canchas (CardCanchaComponent) │
│  ├── Paginación                             │
│  └── Ordenamiento por fecha                 │
└─────────────────────────────────────────────┘
```

### 2.3 Búsqueda por Mapa

```
┌────────────────────┐
│  MapaCanchasComponent│
│  Inicializa Mapbox    │
└────────┬───────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  MapboxService.inicializarMapa()            │
│  ├── Crea instancia mapboxgl.Map            │
│  ├── Agrega controles de navegación        │
│  └── Agrega control de geolocalización     │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  GeolocationService.obtenerPosicionActual() │
│  └── Ubicación del usuario (marcador azul) │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Al mover el mapa (eventos de límites):     │
│  1. Se obtienen límites visibles            │
│     (norte, sur, este, oeste)               │
│  2. Se envía búsqueda por área:            │
│     POST /Cancha/search                     │
│     { area: { norte, sur, este, oeste },    │
│       ...filtros }                          │
│  3. Backend retorna canchas visibles        │
│  4. MapboxService.agregarMarcadoresCanchas()│
│  5. Sidebar muestra cards interactivas      │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Interacción card ↔ marcador:              │
│  ├── Hover en card → resalta marcador      │
│  └── Click en marcador → scroll a card     │
└─────────────────────────────────────────────┘
```

---

## 3. Flujo de Reserva

### 3.1 Selección de Cancha

```
┌──────────────────┐
│  CardCanchaComponent│
│  Click en card      │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Navegación: /cancha/:id                    │
│  └── DetalleCanchaComponent (SSR)           │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  CanchaService.getById(id)                  │
│  └── GET /Cancha/{id}                       │
│      Retorna GetCancha con:                 │
│      ├── Datos básicos (nombre, precio, dir)│
│      ├── Imágenes de cancha                 │
│      ├── Tipos de deporte                   │
│      ├── Servicios                          │
│      ├── Estado de cancha                   │
│      ├── Ubicación (lat, lng)              │
│      └── Horarios disponibles              │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Renderizado:                               │
│  ├── Galería de imágenes                   │
│  ├── Información de la cancha              │
│  ├── Mapa embebido (Mapbox)                │
│  ├── Servicios                             │
│  ├── Selector de fecha (próximos 7 días)   │
│  └── Selector de horarios                  │
└─────────────────────────────────────────────┘
```

### 3.2 Selección de Fecha y Hora

```
┌─────────────────────────────────────────────┐
│  Selector de fecha                          │
│  └── date.utils.generateFutureDates(7)     │
│      Retorna DateOption[]:                  │
│      { dia, numero, mes, fecha }           │
└────────┬────────────────────────────────────┘
         │
         │ Click en fecha
         ▼
┌─────────────────────────────────────────────┐
│  HorarioCanchaService.horarioDisponible()   │
│  └── GET /HorarioCancha/horarioDisponible   │
│      ?idCancha={id}&fecha={fecha}           │
│      Retorna HorarioDisponible[]:           │
│      { idHorarioCancha, horaInicio,        │
│        horaInicioTexto, horaFin,           │
│        horaFinTexto, precio }              │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Agrupación de horarios:                    │
│  └── horario.utils.agruparHorariosPorHora() │
│      [10:00 ($50), 10:30 ($50)]           │
│      → [10:00 ($100)]                      │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Selección del usuario:                     │
│  ├── Click en hora → selecciona/deselecciona│
│  ├── Puede seleccionar múltiples slots      │
│  └── Precio total = sum(precio × slots)    │
└─────────────────────────────────────────────┘
```

### 3.3 Confirmación de Reserva

```
┌─────────────────────────────────────────────┐
│  Click "Reservar"                           │
└────────┬────────────────────────────────────┘
         │
         ├── No autenticado ──────────────────┐
         │   ├── Guarda redirect_after_login  │
         │   │   en sessionStorage            │
         │   └── Redirige a /auth/login       │
         │                                    │
         ▼ Autenticado                        │
┌─────────────────────────────────────────────┐
│  Guarda draft de reserva:                   │
│  localStorage['reserva_draft_${id}'] = {    │
│    canchaId, cancha, fecha,                │
│    selectedTime: TimeOption[],             │
│    duracion, telefono, precioHora,         │
│    total, idTipoDeporte                    │
│  }                                         │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Navegación: /pago                          │
│  └── PaymentComponent                       │
└─────────────────────────────────────────────┘
```

---

## 4. Flujo de Pago

### 4.1 Página de Pago

```
┌─────────────────────────────────────────────┐
│  PaymentComponent                           │
│  Recibe datos de reserva:                   │
│  ├── De navigation state                    │
│  └── De localStorage (reserva_draft)       │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Muestra resumen de reserva:                │
│  ├── Nombre de cancha                       │
│  ├── Fecha seleccionada                     │
│  ├── Horarios seleccionados                 │
│  ├── Desglose de precios                    │
│  ├── Precio total                           │
│  ├── Adelanto (porcentajeAdelanto)          │
│  └── Pendiente de pago                      │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Método de pago: EFECTIVO (código '02')     │
│  └── El operador de la cancha coordina     │
│      el cobro directamente                  │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Click "Confirmar Reserva"                  │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Desagrupar horarios:                       │
│  └── horario.utils.desagruparHorasPorMediaHora()│
│      [10:00 ($100)]                        │
│      → [10:00 ($50), 10:30 ($50)]         │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  ReservaService.create(createReserva)       │
│  └── POST /Reserva                          │
│      CreateReserva {                        │
│        idCliente, idCancha, idTipoDeporte, │
│        fechaReserva, codigoMetodoPago,     │
│        idsHorarioCancha: number[]           │
│      }                                     │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Backend retorna ReservaConPagoDto:         │
│  ├── reserva: GetReserva                    │
│  │   (idReserva, fechaExpiracion,           │
│  │    idEstadoReserva: '01' = Pendiente)    │
│  ├── pago: GetPago                          │
│  │   (idPago, monto, montoAdelanto,         │
│  │    montoPendiente, idEstadoPago)         │
│  ├── codigoReserva: string (código único)  │
│  ├── duracionPreReservaHoras: number       │
│  ├── fechaExpiracionPreReserva: Date       │
│  └── telefonoCancha: string                │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Actualizar teléfono (si cambió):           │
│  └── UsersService.updateTelefono()          │
│      PUT /Usuario/telefono                  │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Modal de éxito (SweetAlert2):              │
│  ├── Código de reserva                      │
│  ├── Fecha de expiración                    │
│  ├── Horas restantes                        │
│  ├── Próximos pasos                         │
│  └── Opciones:                              │
│      ├── Ver mis reservas                   │
│      └── Ir al inicio                       │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Limpieza:                                  │
│  ├── Elimina reserva_draft de localStorage  │
│  └── Navega según opción elegida            │
└─────────────────────────────────────────────┘
```

---

## 5. Flujo de "Mis Reservas"

### 5.1 Listado de Reservas

```
┌─────────────────────────────────────────────┐
│  ListaReservasComponent                     │
│  Ruta: /mis-reservas (protegida AuthGuard) │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  ReservaService.searchMisReservas()         │
│  └── POST /Reserva/mis-reservas/{idUsuario}│
│      QueryParamsModel {                     │
│        filter: SearchReservaClienteFilterDto│
│        { codigoEstado, fechaDesde,          │
│          fechaHasta, estadoPago,            │
│          codigoReserva, nombreCancha },     │
│        page: { page, pageSize },           │
│        sort: [{ property, direction }]      │
│      }                                     │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Backend retorna QueryResultsModel:         │
│  {                                         │
│    items: ReservaClienteDto[],              │
│    total, page, pageSize                    │
│  }                                         │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Renderizado de cada reserva:               │
│  ├── Nombre de cancha                       │
│  ├── Dirección                              │
│  ├── Código de reserva                      │
│  ├── Fecha                                  │
│  ├── Horarios (HoraInicio - HoraFin)       │
│  ├── Monto total / Adelanto / Pendiente     │
│  ├── Estado de reserva (badge)             │
│  ├── Estado de pago (badge)                │
│  └── Alerta si expira en < 6 horas         │
└─────────────────────────────────────────────┘
```

### 5.2 Estados de Reserva

```
┌─────────────────────────────────────────────┐
│  Estados de Reserva (EstadoReservaCodigo)   │
│                                             │
│  '01' = Pendiente    (bg-amber-100)        │
│  ├── Reserva creada, esperando confirmación│
│  ├── Tiene tiempo de expiración            │
│  └── Botón de contacto telefónico activo   │
│                                             │
│  '02' = Confirmado   (bg-green-100)        │
│  ├── Operador confirmó la reserva          │
│  └── Reserva válida para uso               │
│                                             │
│  '03' = Cancelado    (bg-red-100)          │
│  ├── Reserva cancelada                     │
│  └── No puede reactivarse                  │
│                                             │
│  '04' = Expirado     (bg-neutral-200)      │
│  ├── Tiempo de pre-reserva agotado         │
│  ├── Operador no confirmó a tiempo         │
│  └── Reserva invalidada automáticamente    │
└─────────────────────────────────────────────┘
```

### 5.3 Estados de Pago

```
┌─────────────────────────────────────────────┐
│  Estados de Pago (EstadoPago)               │
│                                             │
│  'Pendiente'  (bg-amber-100, color: warn)  │
│  └── No se ha realizado ningún pago        │
│                                             │
│  'Parcial'    (bg-yellow-100, color: warn) │
│  └── Se pagó el adelanto                   │
│                                             │
│  'Pagado'     (bg-green-100, color: success)│
│  └── Pago completo realizado               │
└─────────────────────────────────────────────┘
```

### 5.4 Detalle de Reserva (Modal)

```
┌─────────────────────────────────────────────┐
│  Click en reserva → DetalleReservaComponent │
│  (MatDialog)                                │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Muestra información completa:              │
│  ├── Código de reserva                      │
│  ├── Fecha de reserva                       │
│  ├── Horarios (todos los slots)             │
│  ├── Desglose de montos:                   │
│  │   ├── Precio por hora                    │
│  │   ├── Cantidad de horas                  │
│  │   ├── Monto total                        │
│  │   ├── Adelanto                           │
│  │   └── Pendiente                          │
│  ├── Estado con badge y alertas             │
│  ├── Número de recibo (si tiene)            │
│  └── Contacto telefónico (si pendiente)     │
└─────────────────────────────────────────────┘
```

---

## 6. Flujo de Favoritos

### 6.1 Carga Inicial

```
┌─────────────────────────────────────────────┐
│  Al hacer login:                            │
│  AuthService.logIn()                        │
│  └── Dynamic import: CanchaFavoritaService  │
│      .cargarFavoritosUsuario()              │
│      └── GET /CanchaFavorita/usuario/{id}  │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Se almacena en signal:                     │
│  private _favoritos = signal<Map<number,    │
│    GetCanchaFavorita>>(new Map());           │
│                                             │
│  Key: idCancha                              │
│  Value: GetCanchaFavorita                   │
└─────────────────────────────────────────────┘
```

### 6.2 Toggle Favorito

```
┌─────────────────────────────────────────────┐
│  Click en icono de favorito (corazón)       │
│  └── canchaFavoritaService.toggleFavorito(id)│
└────────┬────────────────────────────────────┘
         │
         ├── Ya es favorito ──────────────────┐
         │   │                                │
         │   ▼                                │
         │   eliminarFavorito()               │
         │   └── DELETE /CanchaFavorita/{id}  │
         │   └── signal.delete(idCancha)      │
         │                                    │
         ▼ No es favorito                     │
┌─────────────────────────────────────────────┐
│  agregarFavorito()                          │
│  └── POST /CanchaFavorita                   │
│      { idUsuario, idCancha }               │
│  └── signal.set(idCancha, GetCanchaFavorita)│
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  UI se actualiza reactivamente:             │
│  ├── Icono de favorito: lleno / vacío      │
│  ├── Filtro "Solo favoritos" funciona       │
│  └── Detalle de cancha muestra estado      │
└─────────────────────────────────────────────┘
```

---

## 7. Entidades del Dominio

### 7.1 Cancha

```
┌─────────────────────────────────────────────┐
│  Cancha                                     │
├─────────────────────────────────────────────┤
│  idCancha: number (PK)                     │
│  idProveedor: number (FK → Usuario)        │
│  idTipoSuperficie: number                  │
│  nombre: string                            │
│  precio: number (precio por hora)          │
│  direccion: string                         │
│  codigoUbigeo: string (FK → Ubigeo)       │
│  latitud: number                           │
│  longitud: number                          │
│  idEstadoCancha: string (FK → EstadoCancha)│
│  tieneTecho: boolean                       │
│  tieneIluminacion: boolean                 │
│  duracionPreReserva: number (horas)        │
│  porcentajeAdelanto: number (0-100)        │
│  calificacionPromedio: number              │
└─────────────────────────────────────────────┘

Relaciones:
├── Cancha → Proveedor (Usuario)
├── Cancha → TipoSuperficie
├── Cancha → Ubigeo (códigoUbigeo)
├── Cancha → EstadoCancha
├── Cancha → ImagenCancha[] (galería)
├── Cancha → TipoDeporte[] (deportes)
├── Cancha → Servicio[] (servicios)
├── Cancha → HorarioCancha[] (disponibilidad)
└── Cancha → CanchaFavorita[] (favoritos)
```

### 7.2 Reserva

```
┌─────────────────────────────────────────────┐
│  Reserva                                    │
├─────────────────────────────────────────────┤
│  idReserva: number (PK)                    │
│  idCliente: number (FK → Usuario)          │
│  idCancha: number (FK → Cancha)            │
│  idTipoDeporte: number (FK → TipoDeporte)  │
│  fechaReserva: Date                        │
│  montoTotal: number                        │
│  idEstadoReserva: string                   │
│    '01' = Pendiente                         │
│    '02' = Confirmado                        │
│    '03' = Cancelado                         │
│    '04' = Expirado                          │
│  fechaExpiracionPreReserva: Date           │
│  codigoMetodoPago: string                  │
│  activo: boolean                           │
└─────────────────────────────────────────────┘

Relaciones:
├── Reserva → Cliente (Usuario)
├── Reserva → Cancha
├── Reserva → TipoDeporte
├── Reserva → Pago[] (pagos asociados)
└── Reserva → HorarioReservadoDto[] (horarios)
```

### 7.3 Pago

```
┌─────────────────────────────────────────────┐
│  Pago                                       │
├─────────────────────────────────────────────┤
│  idPago: number (PK)                       │
│  idReserva: number (FK → Reserva)          │
│  idPlan: number                            │
│  moneda: string (PEN, USD)                 │
│  codigoOperacion: string                   │
│  monto: number                             │
│  montoAdelanto: number                     │
│  montoPendiente: number                    │
│  numeroReferencia: string                  │
│  idMetodoPago: string                      │
│    '02' = Efectivo                          │
│  idEstadoPago: string                      │
│    'Pendiente' | 'Parcial' | 'Pagado'      │
│  activo: boolean                           │
└─────────────────────────────────────────────┘

Relaciones:
└── Pago → Reserva
```

### 7.4 Horario Disponible

```
┌─────────────────────────────────────────────┐
│  HorarioDisponible                          │
├─────────────────────────────────────────────┤
│  idHorarioCancha: number (PK)              │
│  horaInicio: Date                          │
│  horaInicioTexto: string (HH:mm)           │
│  horaFin: Date                             │
│  horaFinTexto: string (HH:mm)             │
│  precio: number                            │
└─────────────────────────────────────────────┘

Relaciones:
└── HorarioCancha → Cancha
└── HorarioCancha → DiaSemana
└── HorarioCancha → Hora (inicio/fin)

Agrupación:
├── Input: [10:00 ($50), 10:30 ($50)]
└── Output: [10:00 ($100)] (agruparHorariosPorHora)

Desagrupación:
├── Input: [10:00 ($100)]
└── Output: [10:00 ($50), 10:30 ($50)] (desagruparHorasPorMediaHora)
```

### 7.5 Ubigeo (Perú)

```
┌─────────────────────────────────────────────┐
│  Ubigeo                                     │
├─────────────────────────────────────────────┤
│  codigoUbigeo: string (6 dígitos)          │
│  departamento: string                      │
│  provincia: string                         │
│  distrito: string                          │
└─────────────────────────────────────────────┘

Estructura jerárquica:
├── Departamento (ej: Lima)
│   └── Provincia (ej: Lima)
│       └── Distrito (ej: Miraflores)
└── Código: 150101 (15=Lima, 01=Lima, 01=Miraflores)
```

---

## 8. Catálogos del Sistema

### 8.1 Estados de Cancha

| Código | Estado | Descripción |
|--------|--------|-------------|
| `'01'` | Aprobado | Cancha visible y disponible para reservas |
| `'02'` | Pendiente | Cancha en revisión por administración |
| `'03'` | Rechazado | Cancha no cumple requisitos |
| `'04'` | Suspendido | Cancha temporalmente deshabilitada |
| `'05'` | Mantenimiento | Cancha en mantenimiento preventivo/correctivo |

### 8.2 Tipos de Deporte

| Código | Deporte |
|--------|---------|
| `'Futbol'` | Fútbol |
| `'Tenis'` | Tenis |
| `'Padel'` | Pádel |
| `'Basquetbol'` | Básquetbol |
| `'Voleibol'` | Voleibol |
| `'Otros'` | Otros deportes |

### 8.3 Estados de Reserva

| Código | Estado | Color Badge |
|--------|--------|-------------|
| `'01'` | Pendiente | amber-100 / amber-800 |
| `'02'` | Confirmado | green-100 / green-800 |
| `'03'` | Cancelado | red-100 / red-800 |
| `'04'` | Expirado | neutral-200 / neutral-600 |

### 8.4 Estados de Pago

| Estado | Color Badge |
|--------|-------------|
| Pendiente | amber-100 / amber-800 |
| Parcial | yellow-100 / yellow-800 |
| Pagado | green-100 / green-800 |

### 8.5 Métodos de Pago

| Código | Método |
|--------|--------|
| `'02'` | Efectivo |

> **Nota**: Actualmente solo se soporta pago en efectivo. El operador de la cancha coordina el cobro directamente con el cliente.

---

## 9. Diagrama de Flujo General

```
                    ┌─────────────────┐
                    │   Landing Page  │
                    │   (HomeComponent)│
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    ┌───────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Búsqueda     │ │  Registro   │ │    Login    │
    │  Canchas      │ │  OAuth      │ │  Tradicional│
    └───────┬───────┘ └──────┬──────┘ └──────┬──────┘
            │                │                │
            ▼                │                │
    ┌───────────────┐        │                │
    │  Listado      │        │                │
    │  Canchas      │        │                │
    └───────┬───────┘        │                │
            │                │                │
            ▼                │                │
    ┌───────────────┐        │                │
    │  Detalle      │        │                │
    │  Cancha       │        │                │
    └───────┬───────┘        │                │
            │                │                │
            ▼                │                │
    ┌───────────────┐        │                │
    │  Selección    │        │                │
    │  Fecha/Hora   │        │                │
    └───────┬───────┘        │                │
            │                │                │
            ▼                │                │
    ┌───────────────┐        │                │
    │  Pago         │◄───────┴────────────────┘
    │  (Efectivo)   │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  Pre-Reserva  │
    │  (Pendiente)  │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  Mis Reservas │
    │  (Listado)    │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  Confirmación │
    │  Operador     │
    └───────────────┘
```
