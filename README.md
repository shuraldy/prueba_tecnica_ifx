# VM Manager — Prueba Técnica IFX

Aplicación full-stack para gestión de máquinas virtuales (VMs) con dashboard interactivo, autenticación segura basada en cookies HttpOnly, actualizaciones en tiempo real vía WebSockets y control de acceso por roles.

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

| Capa       | Tecnología                                      |
|------------|-------------------------------------------------|
| Frontend   | Angular 17+, TailwindCSS, Chart.js / Recharts   |
| Backend    | NestJS 11, TypeScript, TypeORM, SQLite          |
| Auth       | JWT en cookie HttpOnly · Passport.js            |
| Real-time  | Socket.IO 4 (WebSocket Gateway en NestJS)       |
| Validación | class-validator · class-transformer             |

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

Crear el archivo de variables de entorno (ya incluido en el repo para desarrollo local):

```bash
# backend/.env
PORT=3000
JWT_SECRET=8a0vueXaHGWNtJMK78JzJHu64zSqzuSdRHQLSoDPqDn
JWT_EXPIRATION=1d
DB_PATH=./database.sqlite
CORS_ORIGIN=http://localhost:4200
```

Iniciar en modo desarrollo (el seed de base de datos corre automáticamente al arrancar):

```bash
npm run start:dev
```

El servidor quedará disponible en `http://localhost:3000`. La base de datos SQLite (`database.sqlite`) se crea y sincroniza automáticamente. Los datos de prueba (usuarios y VMs) se insertan en el primer arranque vía `SeedService`.

---

### 3. Frontend (Angular)

```bash
cd ../frontend
npm install
ng serve
```

La SPA quedará disponible en `http://localhost:4200`.

---

### 4. Verificar que todo funciona

1. Abrir `http://localhost:4200` → redirige al Login.
2. Iniciar sesión con cualquiera de las credenciales de prueba (ver sección siguiente).
3. El Dashboard carga la lista de VMs y los gráficos de recursos.

---

## Credenciales de Prueba

Insertadas automáticamente por el `SeedService` al arrancar el backend por primera vez.

| Rol            | Email                 | Contraseña   |
|----------------|-----------------------|--------------|
| Administrador  | admin@ifx.com         | Admin123!    |
| Cliente        | cliente@ifx.com       | Cliente123!  |

> **Administrador**: acceso total — crear, editar, eliminar VMs y ver el dashboard completo.  
> **Cliente**: solo lectura — los botones de acción no se renderizan en la UI.

### VMs precargadas

| Nombre          | SO        | Estado      |
|-----------------|-----------|-------------|
| web-server      | Ubuntu    | Encendida   |
| db-server       | Debian    | Encendida   |
| cache-server    | Alpine    | Apagada     |
| worker-node     | CentOS    | Suspendida  |
| monitoring      | Ubuntu    | Encendida   |

---

## Arquitectura y Diagrama

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                     │
│                                                              │
│   ┌───────────────┐        ┌──────────────────────────────┐ │
│   │  Angular SPA  │◄──────►│  Socket.IO Client            │ │
│   │  (port 4200)  │        │  (escucha vm:created,        │ │
│   └──────┬────────┘        │   vm:updated, vm:deleted)    │ │
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
│  │  POST /auth/login  →  AuthController                 │    │
│  │  POST /auth/logout →  AuthController                 │    │
│  │  GET  /auth/me     →  AuthController [JWT Guard]     │    │
│  │                                                      │    │
│  │  GET    /vms       →  VmsController  [JWT + Roles]   │    │
│  │  POST   /vms       →  VmsController  [Admin only]    │    │
│  │  PUT    /vms/:id   →  VmsController  [Admin only]    │    │
│  │  DELETE /vms/:id   →  VmsController  [Admin only]    │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────┐    │
│  │              Clean Architecture Layers               │    │
│  │                                                      │    │
│  │  Infrastructure → Application (Use Cases) → Domain  │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────┐    │
│  │              Socket.IO Gateway (VmsGateway)          │    │
│  │  Emite eventos en tiempo real tras cada mutación     │    │
│  │  vm:created · vm:updated · vm:deleted                │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────┐    │
│  │            TypeORM + SQLite (database.sqlite)        │    │
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

---

## Decisiones Arquitectónicas

### ¿Por qué NestJS?

NestJS provee estructura modular y soporte nativo para Dependency Injection, Guards, Pipes y WebSocket Gateways — todo lo que la prueba requería sin necesidad de librerías adicionales. Su ecosistema TypeScript-first elimina errores en tiempo de ejecución y mejora la mantenibilidad.

### ¿Por qué Angular?

Angular es opinionado por diseño: módulos, servicios, guards e interceptores son ciudadanos de primera clase del framework. Eso permite implementar Optimistic UI con `HttpInterceptor`, proteger rutas con `AuthGuard` y gestionar estado global con servicios reactivos + RxJS sin depender de librerías externas de estado.

### ¿Por qué SQLite?

Para una prueba técnica local, SQLite elimina la fricción de setup sin sacrificar las capacidades de TypeORM. El cambio a PostgreSQL o MySQL en producción requiere únicamente cambiar el driver y las variables de entorno — la capa de repositorios abstractos lo absorbe sin modificar el código de dominio.

### ¿Por qué Cookie HttpOnly en lugar de localStorage?

El enunciado lo requería explícitamente por seguridad. Las cookies `HttpOnly` no son accesibles desde JavaScript, eliminando el vector de ataque XSS más común. El flag `SameSite=Strict` mitiga CSRF. El frontend nunca toca el token directamente — lo gestiona el navegador de forma transparente.

### Estructura de carpetas (Clean Architecture)

Cada módulo (`auth`, `vms`) sigue tres capas con dependencias unidireccionales:

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

Esta separación garantiza que el núcleo de negocio (`domain` + `application`) sea independiente del framework y testeable de forma aislada.

### Estructura del Frontend (Angular)

```
src/app/
├── core/               # Servicios singleton, interceptores, guards
│   ├── auth/
│   ├── interceptors/   # HTTP interceptor (Optimistic UI, manejo de errores)
│   └── socket/         # Socket.IO service
├── features/           # Módulos por ruta (lazy loading)
│   ├── auth/           # Login page
│   ├── dashboard/      # Panel principal + gráficos
│   └── vms/            # Listado, creación y edición de VMs
├── shared/             # Componentes reutilizables
│   ├── components/     # Skeletons, toasts, empty states, confirm modal
│   └── pipes/
└── layout/             # Shell principal (navbar, sidebar)
```

---

## Bitácora de IA

### Herramientas utilizadas

- **Claude Code (claude-sonnet-4-6)** — asistente principal integrado en el editor (VSCode), usado para scaffolding, revisión de código y resolución de problemas arquitectónicos.
- Skills instaladas localmente: `angular-developer` y `nestjs-best-practices`.

---

### ¿Para qué se delegó el trabajo pesado?

| Tarea                                      | Delegado a IA | Intervención manual                                      |
|--------------------------------------------|:-------------:|----------------------------------------------------------|
| Scaffolding del módulo `auth` (Clean Arch) | ✓             | Ajuste del `JwtStrategy` para leer la cookie en lugar del header Authorization |
| CRUD de VMs (use cases + controller)       | ✓             | Revisión de reglas de validación de DTOs y mensajes de error |
| Configuración de Socket.IO Gateway         | ✓             | Integración con los controllers para emitir eventos post-mutación |
| Seed Service con datos de prueba           | ✓             | —                                                        |
| Arquitectura de carpetas del frontend      | Parcial       | Decisión final de no usar NgRx y optar por servicios RxJS propios |
| Optimistic UI (interceptor Angular)        | Parcial       | Lógica de rollback en caso de error del servidor         |
| Diseño del dashboard (Dark Mode)           | —             | Diseño propio con TailwindCSS                            |

---

### Prompts clave

**1. Configuración de WebSockets con emisión post-mutación:**

> "En NestJS tengo un `VmsGateway` con Socket.IO y un `VmsController`. Necesito que cada vez que el controller ejecute `createVm`, `updateVm` o `deleteVm`, el gateway emita un evento `vm:created`, `vm:updated` o `vm:deleted` respectivamente con el payload de la VM afectada. El gateway debe ser inyectado en el controller sin crear dependencias circulares. Dame la implementación completa con el módulo actualizado."

*Por qué fue clave:* la inyección circular entre Gateway y Controller es un antipatrón común. El prompt forzó al modelo a pensar en la dirección de dependencias y producir una solución limpia.

---

**2. Optimistic UI con rollback en Angular:**

> "Tengo un `VmService` en Angular que llama a `PUT /vms/:id`. Quiero implementar Optimistic UI: antes de hacer el request HTTP, actualizo inmediatamente el estado local del listado de VMs en un `BehaviorSubject`. Si el request falla con cualquier status >= 400, revierto el estado al snapshot anterior y muestro un toast de error. Si tiene éxito, sincronizo con la respuesta del servidor. Dame el método `updateVm()` completo con este comportamiento."

*Por qué fue clave:* el manejo del snapshot + rollback requiere timing preciso con RxJS (`tap`, `catchError`). El prompt especificó exactamente el contrato esperado, evitando que la IA produjera una solución genérica sin manejo de errores.
