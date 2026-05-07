# Gestor de Recetas y Menús - Guía de Despliegue

## Descripción
Aplicación web para gestión de recetas con generación automática de menús semanales. Compatible con dispositivos móviles conectados a la misma red WiFi.

## Arquitectura
- **Backend**: Node.js + Express con arquitectura modular (Entity, Repository, Service, Controller, Routes)
- **Frontend**: HTML5 + Tailwind CSS + JavaScript ES6 Modules con arquitectura modular
- **Estado**: AppState observable para gestión de estado global
- **Acceso**: Disponible para dispositivos en la misma red local

## Requisitos Previos
- Node.js (versión 14 o superior)
- npm o yarn
- Conexión a red WiFi

## Instalación

1. **Clonar o copiar el proyecto**
   ```bash
   cd windsurf-project
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor**
   ```bash
   npm start
   ```
   O para desarrollo con recarga automática:
   ```bash
   npm run dev
   ```

## Acceso desde Dispositivos Móviles

### 1. Obtener tu IP Local
**Windows:**
```cmd
ipconfig
```
Busca "Dirección IPv4" bajo tu adaptador WiFi

**macOS/Linux:**
```bash
ip addr show
```
o
```bash
ifconfig
```

### 2. Acceder desde el Móvil
1. Conecta el móvil a la misma red WiFi
2. Abre el navegador
3. Ingresa: `http://TU_IP_LOCAL:3000`

Ejemplo: `http://192.168.1.100:3000`

## Características Implementadas

### CRUD de Recetas
- ✅ **Crear**: Formulario completo con categorías y tiempos
- ✅ **Leer**: Vista en cuadrícula con búsqueda por nombre/categoría/tiempo
- ✅ **Actualizar**: Modal de edición con validación
- ✅ **Eliminar**: Confirmación y borrado seguro
- ✅ **Filtrado por Categorías**: Botones toggle para cada categoría (comida, cena, general, etc.)

### Gestión de Menús
- ✅ **Generación Automática**: Menús semanales con recetas aleatorias
- ✅ **Creación Manual**: Selector de recetas por día y comida
- ✅ **Visualización**: Menús desplegables con nombres personalizados
- ✅ **Tiempo Detallado**: Prep, Cocción y Total para cada receta

### Características Móviles
- ✅ **Diseño Responsivo**: Adaptado a pantallas táctiles
- ✅ **Navegación Táctil**: Botones optimizados para dedos
- ✅ **Sin Zoom Forzado**: viewport configurado para móvil
- ✅ **Acceso WiFi**: Disponible en toda la red local

### Arquitectura Frontend Modular
- ✅ **ES6 Modules**: Código organizado en módulos con import/export
- ✅ **AppState Observable**: Estado global reactivo con suscripción
- ✅ **BaseManager**: Clase base para managers con operaciones CRUD
- ✅ **Componentes Reutilizables**: RecipeCard para diferentes vistas

### Categorías de Recetas
- General (☀️🌙)
- Comida (☀️)
- Cena (🌙)
- Picoteo (🍪)
- Dulce (🍬)

## Estructura de Archivos

```
windsurf-project/
├── backend/
│   ├── server.js              # Punto de entrada y bootstrap de repositorios
│   ├── .windsurfrules         # Reglas de arquitectura para el agente backend
│   ├── src/
│   │   ├── app.js             # Configuración Express y registro de rutas
│   │   ├── config/            # Configuración centralizada (puerto, host)
│   │   ├── recipes/           # Módulo Recetas (5 archivos obligatorios)
│   │   │   ├── recipe.entity.js
│   │   │   ├── recipe.repository.js
│   │   │   ├── recipe.service.js
│   │   │   ├── recipe.controller.js
│   │   │   └── recipe.routes.js
│   │   ├── menus/             # Módulo Menús (5 archivos obligatorios)
│   │   │   ├── menu.entity.js
│   │   │   ├── menu.repository.js
│   │   │   ├── menu.service.js
│   │   │   ├── menu.controller.js
│   │   │   └── menu.routes.js
│   │   └── shared/            # Utilidades compartidas
│   │       ├── errors/
│   │       │   └── AppError.js
│   │       ├── middleware/
│   │       │   └── errorHandler.js
│   │       └── repositories/
│   │           └── JsonRepository.js
│   └── data/
│       ├── recipes.json       # Persistencia JSON de recetas
│       └── menus.json         # Persistencia JSON de menús
├── frontend/
│   ├── index.html             # SPA única (no se crean páginas adicionales)
│   ├── css/
│   │   └── styles.css         # Sistema de diseño: modales, filtros de categoría
│   ├── .windsurfrules         # Reglas de arquitectura para el agente frontend
│   └── js/
│       ├── app.js             # Coordinador principal: managers, funciones globales, init
│       ├── config.js          # Constantes centralizadas (API_BASE)
│       ├── apiService.js      # Único punto de salida HTTP (no fetch() directo)
│       ├── utils.js           # Funciones puras: escapeHtml, showSuccess, showError
│       ├── uiHelpers.js       # Generadores de HTML compartidos (badges)
│       ├── tabManager.js      # Navegación por tabs
│       ├── menuManager.js     # Gestión de menús semanales + sustitución
│       ├── manualMenuManager.js # Creación manual de menús (grid 7 días)
│       ├── core/
│       │   └── AppState.js    # Estado observable global (get/set/subscribe)
│       ├── features/
│       │   └── recipes/
│       │       └── RecipeManager.js   # Manager de recetas (extiende BaseManager)
│       └── shared/
│           ├── BaseManager.js       # Clase base CRUD para managers
│           ├── components/
│           │   ├── RecipeCard.js    # Componente reutilizable de tarjeta
│           │   ├── UnifiedModal.js  # Sistema de modales genérico
│           │   ├── SearchBar.js     # Barra de búsqueda con filtros de categoría
│           │   └── Modal.js         # Componente modal legacy
│           └── utils.js             # Utilidades compartidas entre features
├── .windsurf/
│   └── workflows/
│       ├── add-crud-entity.md       # Workflow: Añadir nueva entidad CRUD
│       └── debug-layers.md        # Workflow: Depurar errores por capas
├── DEPLOYMENT.md              # Guía de despliegue
├── README.md                  # Documentación completa
└── package.json               # Dependencias
```

## Configuración del Servidor

El servidor se configura automáticamente para:
- **Escuchar en todas las interfaces**: `0.0.0.0:3000`
- **Servir archivos estáticos**: Desde `/frontend`
- **CORS habilitado**: Para acceso desde cualquier dispositivo
- **Datos persistentes**: En archivos JSON locales

## Endpoints de la API

### Recetas
- `GET /api/recipes` - Obtener todas las recetas
- `POST /api/recipes` - Crear nueva receta
- `PUT /api/recipes/:id` - Actualizar receta
- `DELETE /api/recipes/:id` - Eliminar receta

### Menús
- `GET /api/menus` - Obtener todos los menús
- `POST /api/menus/generate` - Generar menú automático
- `POST /api/menus` - Crear menú manual
- `PUT /api/menus/:id` - Actualizar menú
- `DELETE /api/menus/:id` - Eliminar menú

## Solución de Problemas

### No puedo acceder desde el móvil
1. **Verifica la conexión WiFi**: Ambos dispositivos en la misma red
2. **Firewall**: Permite tráfico en el puerto 3000
3. **IP correcta**: Confirma tu dirección IP local
4. **Servidor activo**: `npm start` debe estar corriendo

### El servidor no inicia
1. **Puerto ocupado**: Cambia el puerto con `PORT=3001 npm start`
2. **Permisos**: Ejecuta como administrador si es necesario
3. **Node.js**: Verifica que esté instalado correctamente

### Las recetas no se guardan
1. **Permisos de escritura**: Verifica acceso a `/backend/data/`
2. **Espacio en disco**: Asegura espacio disponible
3. **JSON válido**: No edites manualmente los archivos JSON

## Desarrollo

### Variables de Entorno
```bash
PORT=3000              # Puerto del servidor
HOST=0.0.0.0          # Interfaz de red
```

### Logs del Servidor
El servidor muestra:
- URL local: `http://localhost:3000`
- URL para móviles: `http://TU_IP:3000`
- Interfaz de red: `0.0.0.0:3000`

## 🤖 Reglas y Workflows de Cascade (Agente AI)

Este proyecto incluye reglas de arquitectura y workflows para el agente AI (Cascade), ubicados en:
- **Frontend rules**: `frontend/.windsurfrules`
- **Backend rules**: `backend/.windsurfrules`
- **Workflows**: `.windsurf/workflows/`

### Reglas Frontend (`frontend/.windsurfrules`)

Reglas arquitectónicas que rigen el desarrollo en el frontend:

- **Módulos ES6**: Usar exclusivamente `import/export`. No usar `require()`.
- **Estado global**: Usar `AppState` (singleton) con `get()` y `set()`. No usar `localStorage`.
- **Patrón Manager**: Cada feature tiene su clase `*Manager` con métodos: `loadItems()`, `render()`, `save()`, `delete()`.
- **Comunicación HTTP**: Todas las llamadas HTTP **solo** mediante `apiService`. No `fetch()` directo.
- **Funciones globales**: Las funciones llamadas desde `onclick` en HTML se declaran en `app.js` y se exponen en `window`.
- **SPA única**: Un único `index.html`. Navegación por tabs con `TabManager`.
- **Renderizado**: HTML como strings con template literals. No frameworks adicionales.

### Reglas Backend (`backend/.windsurfrules`)

Reglas arquitectónicas que rigen el desarrollo en el backend:

- **Patrón de 5 archivos por entidad**: `entity`, `repository`, `service`, `controller`, `routes`.
- **Entity**: Exponer `static validate(data)` y `static fromRequest(data)`. No asignar `id`, `createdAt`, `updatedAt`.
- **Repository**: Extender `JsonRepository`. No escribir al FS directamente.
- **Service**: Flujo estándar: `fromRequest()` → `validate()` → `repository.create()`. Usar `AppError`.
- **Controller**: Solo extrae datos de `req` y delega. Nunca lógica de negocio. Siempre `try/catch` + `next(error)`.
- **Routes**: Registrar bajo `/api/<entidad>`, **antes** del middleware de archivos estáticos.
- **Módulos CommonJS**: Usar exclusivamente `require()` y `module.exports`.

### Workflows Disponibles

#### `/add-crud-entity` — Añadir nueva entidad CRUD completa

Workflow paso a paso para añadir una nueva entidad al sistema (backend + frontend):

1. **Backend**: Crear entity, repository, service, controller y routes.
2. **Registrar rutas** en `backend/src/app.js`.
3. **Registrar persistencia** en `backend/server.js` (bootstrap).
4. **Frontend**: Añadir métodos en `apiService.js`.
5. **Frontend**: Crear el Manager en `frontend/js/features/<entidad>/`.
6. **Frontend**: Registrar el Manager en `app.js`.
7. **Frontend**: Añadir sección en `index.html`.

#### `/debug-layers` — Depurar errores por capas

Workflow sistemático para diagnosticar bugs respetando la separación de capas:

1. **Identificar capa afectada**: UI → AppState → HTTP → Controller → Service → Repository.
2. **Aplicar fix en la capa raíz**, no donde se manifiesta el síntoma.
3. **Reglas**: No duplicar validaciones, no usar `fetch()` directo, no modificar formato JSON.

## Seguridad
- **Solo red local**: No accesible desde internet
- **Sin autenticación**: Confiable para uso familiar
- **Datos locales**: Almacenamiento en JSON local

## Soporte
Para problemas o sugerencias, revisa los logs del servidor o verifica la configuración de red.
