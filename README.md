# VM Manager — Prueba Técnica IFX

Aplicación full-stack para gestión de máquinas virtuales con dashboard interactivo, autenticación segura basada en cookies HttpOnly, actualizaciones en tiempo real vía WebSockets y control de acceso por roles.

---

## Tabla de Contenidos

1. [Stack Tecnológico](#stack-tecnológico)
2. [Guía de Despliegue Local](#guía-de-despliegue-local)
3. [Credenciales de Prueba](#credenciales-de-prueba)
4. [Arquitectura y Diagrama](#arquitectura-y-diagrama)
5. [Decisiones Arquitectónicas](#decisiones-arquitectónicas)
6. [Bitácora de IA](#bitácora-de-ia)

---

## Stack Tecnológico

| Capa       | Tecnología                                           |
|------------|------------------------------------------------------|
| Frontend   | Angular 19, TailwindCSS, PrimeNG 19, Chart.js        |
| Backend    | NestJS 11, TypeScript, TypeORM, SQLite               |
| Auth       | JWT en cookie HttpOnly · Passport.js                 |
| Real-time  | Socket.IO 4 (WebSocket Gateway en NestJS)            |
| Validación | class-validator · class-transformer                  |

---

## Guía de Despliegue Local

### Requisitos previos

- Node.js >= 20
- npm >= 10
- Angular CLI (`npm install -g @angular/cli`)

---

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd prueba_tecnica_ifx
```

---

### 2. Backend (NestJS)

```bash
cd backend
npm install
```

Crear el archivo de variables de entorno a partir del ejemplo:

```bash
cp .env.example .env
```

Editar `.env` con los valores correspondientes (ver `.env.example` para referencia). El campo `JWT_SECRET` debe ser un string aleatorio seguro.

Iniciar en modo desarrollo (el seed corre automáticamente al arrancar):

```bash
npm run start:dev
```

El servidor quedará disponible en `http://localhost:3000`. La base de datos SQLite (`database.sqlite`) se crea y sincroniza automáticamente. Los datos de prueba se insertan en el primer arranque vía `SeedService`.

---

### 3. Frontend (Angular)

```bash
cd ../frontend
npm install
```

Crear el archivo de entorno a partir del ejemplo:

```bash
cp src/environments/environment.ts.example src/environments/environment.ts
```

Iniciar el servidor de desarrollo:

```bash
ng serve
```

La SPA quedará disponible en `http://localhost:4200`.

---

### 4. Verificar que todo funciona

1. Abrir `http://localhost:4200` → redirige al Login.
2. Iniciar sesión usando el autofill de credenciales en la pantalla de login.
3. El Dashboard carga estadísticas y gráficos de recursos en tiempo real.

---

## Credenciales de Prueba

Insertadas automáticamente por el `SeedService` al arrancar el backend por primera vez.

> Las credenciales están disponibles directamente en la pantalla de login mediante tarjetas de autofill — haz clic en "Admin" o "Cliente" para completar el formulario automáticamente.

| Rol            | Email                 |
|----------------|-----------------------|
| Administrador  | admin@ifx.com         |
| Cliente        | cliente@ifx.com       |

> **Administrador**: acceso total — crear, editar, eliminar VMs y ver el dashboard completo.  
> **Cliente**: solo lectura — los controles de acción no se renderizan en la UI. Recibe notificaciones en tiempo real cuando un administrador modifica el estado de una VM.

---

## Arquitectura y Diagrama

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                     │
│                                                              │
│   ┌───────────────┐        ┌──────────────────────────────┐ │
│   │  Angular SPA  │◄──────►│  Socket.IO Client            │ │
│   │  (port 4200)  │        │  (vm:created, vm:updated,    │ │
│   └──────┬────────┘        │   vm:deleted, vm:stats)      │ │
│          │ HTTP + Cookie   └──────────────┬───────────────┘ │
└──────────┼──────────────────────────────┼─────────────────┘
           │                              │ WebSocket (ws://)
           ▼                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     BACKEND (NestJS · port 3000)             │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  HTTP REST API                       │    │
│  │                                                      │    │
│  │  POST /auth/login       →  AuthController            │    │
│  │  POST /auth/logout      →  AuthController            │    │
│  │  GET  /auth/me          →  AuthController [JWT]      │    │
│  │                                                      │    │
│  │  GET    /vms            →  VmsController  [JWT+Rol]  │    │
│  │  POST   /vms            →  VmsController  [Admin]    │    │
│  │  PUT    /vms/:id        →  VmsController  [Admin]    │    │
│  │  PATCH  /vms/:id/status →  VmsController  [Admin]    │    │
│  │  DELETE /vms/:id        →  VmsController  [Admin]    │    │
│  │  GET    /vms/stats      →  VmsController  [JWT]      │    │
│  │                                                      │    │
│  │  GET  /vm-resources/cores|ram|disk|os  [JWT]         │    │
│  │  POST /vm-resources/os                [Admin]        │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────┐    │
│  │              Clean Architecture Layers               │    │
│  │  Infrastructure → Application (Use Cases) → Domain  │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────┐    │
│  │              Socket.IO Gateway (VmsGateway)          │    │
│  │  Emite eventos tras cada mutación:                   │    │
│  │  vm:created · vm:updated · vm:deleted · vm:stats     │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────┐    │
│  │       TypeORM + SQLite — Tablas de lookup FK         │    │
│  │  vm_cores · vm_ram · vm_disk · vm_os · vms · users  │    │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Flujo de autenticación

```
Browser                          Backend
   │                                │
   │── POST /auth/login ──────────►│
   │   { email, password }          │── bcrypt.compare()
   │                                │── jwt.sign()
   │◄─ 200 OK + Set-Cookie ─────── │
   │   { user, role }               │   (HttpOnly, Secure, SameSite=Strict)
   │                                │
   │── GET /vms (cookie auto) ────►│
   │                                │── JwtStrategy extrae cookie
   │◄─ 200 [ ...vms ] ────────────│── RolesGuard valida rol
```

### Flujo de tiempo real (WebSockets)

```
Admin Browser                    Backend                   Client Browser
      │                             │                             │
      │── PUT /vms/:id/status ────►│                             │
      │                             │── updateStatus use case    │
      │◄─ 200 OK ─────────────────│                             │
      │   toast propio             │── emitVmUpdated()           │
      │                             │── emitVmStats()             │
      │                             │──── ws: vm:updated ───────►│
      │                             │──── ws: vm:stats ─────────►│
      │                             │                  toast notif│
      │                             │             dashboard live  │
```

---

## Decisiones Arquitectónicas

### ¿Por qué NestJS?

NestJS provee estructura modular y soporte nativo para Dependency Injection, Guards, Pipes y WebSocket Gateways — todo lo que la prueba requería sin necesidad de librerías adicionales. Su ecosistema TypeScript-first elimina errores en tiempo de ejecución y mejora la mantenibilidad.

### ¿Por qué Angular 19?

Angular es opinionado por diseño: guards, interceptores y servicios son ciudadanos de primera clase del framework. La API de señales (`signal`, `effect`) de Angular 19 permite estado reactivo fino sin RxJS en la capa de UI, mientras que los guards async con `Observable` gestionan el flujo de autenticación de forma declarativa.

### ¿Por qué SQLite con tablas de lookup?

Para una prueba técnica local, SQLite elimina la fricción de setup. Las tablas de lookup (`vm_cores`, `vm_ram`, `vm_disk`, `vm_os`) con FK garantizan integridad referencial y valores controlados. El cambio a PostgreSQL requiere únicamente cambiar el driver — la capa de repositorios abstractos lo absorbe sin modificar el código de dominio.

### ¿Por qué Cookie HttpOnly en lugar de localStorage?

Las cookies `HttpOnly` no son accesibles desde JavaScript, eliminando el vector de ataque XSS más común. El flag `SameSite=Strict` mitiga CSRF. El frontend nunca toca el token directamente — lo gestiona el navegador de forma transparente. El guard de Angular llama a `GET /auth/me` al refrescar la página para restaurar la sesión sin exponer el token.

### Estructura de carpetas (Clean Architecture)

```
src/
└── <módulo>/
    ├── domain/           # Entidades y contratos (sin dependencias externas)
    │   ├── entities/
    │   └── repositories/ # Interfaces abstractas
    ├── application/      # Casos de uso, DTOs (depende solo de domain)
    │   ├── use-cases/
    │   └── dtos/
    └── infrastructure/   # Implementaciones concretas (NestJS, TypeORM, Socket.IO)
        ├── controllers/
        ├── repositories/
        ├── guards/
        ├── strategies/
        └── gateways/
```

### Estructura del Frontend (Angular)

```
src/app/
├── core/               # Servicios singleton, interceptores, guards, modelos
│   ├── guards/         # authGuard / publicGuard (async, cookie-aware)
│   ├── interceptors/   # credentialsInterceptor
│   └── services/       # AuthService, VmService, VmResourcesService,
│                       # SocketService, ToastService, ThemeService
├── features/
│   ├── auth/           # Login (split-screen, autofill)
│   ├── dashboard/      # Estadísticas + gráficos Chart.js (doughnut + bar)
│   └── vms/            # Listado paginado, formulario create/edit
├── shared/
│   ├── components/     # StatusBadge, Skeleton, Paginator, Toast
│   └── pipes/
└── layout/
    └── shell/          # Sidebar colapsable, navbar, socket subscriptions
```

---

## Bitácora de IA

### Herramientas utilizadas

- **Claude Code (claude-sonnet-4-6)** — asistente principal integrado en el editor (VSCode), usado para scaffolding, revisión de código y resolución de problemas arquitectónicos.
- Skills instaladas localmente: `angular-developer` y `nestjs-best-practices`.

---

### ¿Para qué se delegó el trabajo pesado?

| Tarea                                              | Delegado a IA | Intervención manual                                                          |
|----------------------------------------------------|:-------------:|------------------------------------------------------------------------------|
| Scaffolding del módulo `auth` (Clean Arch)         | ✓             | Ajuste del `JwtStrategy` para leer cookie en lugar del header Authorization  |
| CRUD de VMs (use cases + controller)               | ✓             | Revisión de reglas de validación de DTOs y mensajes de error                 |
| Tablas de lookup FK (cores, ram, disk, os)         | ✓             | Decisión de valores semilla y rango (base 2 para cores y ram)                |
| Configuración de Socket.IO Gateway                 | ✓             | Integración con controllers para emitir `vm:stats` post-mutación             |
| Seed Service con datos de prueba                   | ✓             | —                                                                            |
| Optimistic UI (rollback en error)                  | Parcial       | Lógica de snapshot + rollback en `VmService`                                 |
| Diseño del login (split-screen)                    | Parcial       | Decisión del layout, paleta y funcionalidad de autofill                      |
| Dashboard (gráficos, dark mode)                    | Parcial       | Escala logarítmica para el bar chart, sincronización con señales de Angular  |
| Auth guard async (fix refresh → login)             | ✓             | —                                                                            |
| Notificaciones WebSocket para rol Cliente          | ✓             | Decisión de separar toasts por rol (admin vs cliente)                        |

---

### Prompts clave

**1. WebSockets con emisión post-mutación y propagación de stats:**

> "En NestJS tengo un `VmsGateway` con Socket.IO y un `VmsController`. Necesito que cada vez que el controller ejecute `createVm`, `updateVm`, `updateStatus` o `deleteVm`, el gateway emita el evento correspondiente más un evento `vm:stats` actualizado. El gateway debe inyectarse en el controller sin crear dependencias circulares."

*Por qué fue clave:* la inyección circular entre Gateway y Controller es un antipatrón común. El prompt forzó al modelo a pensar en la dirección de dependencias y producir una solución limpia, y extendió el contrato para incluir las estadísticas en tiempo real.

---

**2. Tablas de lookup con FK en TypeORM + resolución en repositorio:**

> "Quiero crear tablas separadas `vm_cores`, `vm_ram`, `vm_disk`, `vm_os` con FK hacia la tabla `vms`. El API debe seguir recibiendo y devolviendo valores escalares (`cores: 4`, `os: 'Ubuntu'`). La resolución de FK debe ocurrir en el repositorio, transparente para los casos de uso."

*Por qué fue clave:* mantener el contrato del API inalterado mientras se introduce integridad referencial requirió un mapper `toDomain()` y un resolver `resolveRefs()` bien definidos en la capa de infraestructura.

---

**3. Auth guard async para evitar redirect en refresh:**

> "Al refrescar la página, el `authGuard` redirige al login porque `currentUser()` es null. El token vive en una cookie HttpOnly. ¿Cómo hago que el guard llame a `GET /auth/me` antes de decidir si redirige?"

*Por qué fue clave:* el guard necesitaba retornar un `Observable<boolean | UrlTree>` en lugar de un booleano síncrono — un cambio pequeño con un impacto grande en la UX.
