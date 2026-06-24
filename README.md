# Frontend — SmartLogix

Interfaz de usuario del sistema SmartLogix, construida con React 19, TypeScript y Vite. Se comunica exclusivamente con el API Gateway (BFF) en el puerto 9090.

---

## Arquitectura Frontend

### Estructura de componentes

```
Frontend (React + Vite)
├── Layout (componente raíz con Sidebar de navegación)
│   ├── Home          → Dashboard con estadísticas (consume /bff/v1/dashboard)
│   ├── ProductsPage  → CRUD de productos        (/api/v1/products)
│   ├── BranchesPage  → CRUD de sucursales       (/api/v1/branches)
│   ├── WarehousesPage→ CRUD de bodegas          (/api/v1/warehouses)
│   ├── OrdersPage    → CRUD de pedidos          (/api/v1/orders)
│   ├── UsersPage     → CRUD de usuarios         (/api/v1/users)
│   └── RolesPage     → CRUD de roles            (/api/v1/roles)
```

Toda comunicación con el backend pasa por el API Gateway (puerto 9090). No hay llamadas directas a los microservicios.

### Patrones de diseño aplicados

**1. Module Pattern** — `src/api/`
Cada dominio de negocio tiene su propio módulo de acceso a la API encapsulado en un archivo independiente (`inventario.ts`, `pedidos.ts`, `usuarios.ts`, `config.ts`). Esto evita que los componentes accedan directamente a `fetch`/axios y centraliza la configuración de las URLs base. Beneficio: cambiar el endpoint base sólo requiere editar un archivo.

**2. Observer Pattern** — Hooks de React (`useState`, `useEffect`)
Los componentes se suscriben a cambios de estado mediante hooks. Cuando el estado cambia (por ejemplo, tras una petición a la API), React notifica al componente para re-renderizar. Este es el patrón Observer implementado de forma nativa en el ecosistema React.

---

## Estructura de directorios

```
frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/               # Clientes HTTP por dominio (Module Pattern)
│   │   ├── config.ts      # URL base de la API
│   │   ├── inventario.ts  # Endpoints de productos, sucursales, bodegas
│   │   ├── pedidos.ts     # Endpoints de pedidos
│   │   └── usuarios.ts    # Endpoints de usuarios y roles
│   ├── components/        # Componentes reutilizables
│   │   ├── Layout.tsx     # Contenedor principal con navegación
│   │   └── Sidebar.tsx    # Menú lateral de navegación
│   ├── css/
│   │   └── styles.css
│   ├── hooks/             # Custom hooks de React
│   ├── pages/             # Páginas de la aplicación (una por ruta)
│   │   ├── Home.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── BranchesPage.tsx
│   │   ├── WarehousesPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── UsersPage.tsx
│   │   └── RolesPage.tsx
│   ├── types/
│   │   └── index.ts       # Tipos TypeScript compartidos
│   ├── utils/             # Funciones utilitarias
│   ├── App.tsx            # Definición de rutas (React Router)
│   └── main.tsx           # Punto de entrada
├── .env.example
├── Dockerfile
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Dependencias

Las dependencias están declaradas en `package.json`:

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| react | ^19.2.5 | Framework UI |
| react-dom | ^19.2.5 | Renderizado en el DOM |
| react-router-dom | ^7.14.2 | Navegación SPA |
| bootstrap | 5.3.8 | Estilos y componentes visuales |
| bootstrap-icons | ^1.13.1 | Iconografía |
| typescript | ~6.0.2 | Tipado estático |
| vite | ^8.0.9 | Bundler y servidor de desarrollo |

---

## Instalación

**Requisitos previos:** Node.js >= 18, npm >= 9

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar la variable de entorno con la URL del API Gateway
cp .env.example .env
# Editar .env y establecer:
# VITE_API_URL=http://localhost:9090
```

---

## Ejecución

### Desarrollo

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:3000` (o el puerto que indique Vite).

### Producción (build)

```bash
npm run build
# Los archivos estáticos quedan en dist/
npm run preview   # Previsualización local del build
```

### Con Docker

```bash
docker build --build-arg VITE_API_URL=http://localhost:9090 -t smartlogix-frontend .
docker run -p 80:80 smartlogix-frontend
```

### Con Docker Compose (recomendado)

Desde la raíz del proyecto:

```bash
# Compilar los JARs de los servicios backend primero
# Luego levantar todos los servicios
docker compose up --build
```

La aplicación queda en `http://localhost:80`.

---

## Pruebas

```bash
# Ejecutar pruebas unitarias (cuando estén configuradas)
npm test

# Verificar tipado TypeScript
npx tsc --noEmit

# Lint del código
npm run lint
```

---

## Estrategia de branching

| Rama | Propósito |
|------|-----------|
| `main` | Rama estable, código en producción |
| `develop` | Integración de funcionalidades |
| `feature/*` | Desarrollo de funcionalidades nuevas |
| `fix/*` | Corrección de bugs |

Los merges a `main` requieren PR y revisión. Los commits siguen la convención `tipo(alcance): descripción` (ej. `feat(pedidos): agregar filtro por estado`).
