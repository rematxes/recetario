# Gestor de Recetas y Menús Semanales

Una aplicación web CRUD para gestionar recetas y generar menús semanales automáticamente. **Accesible desde dispositivos móviles en la misma red WiFi.**

## 🚀 Características Principales

### 🍳 Gestión Completa de Recetas
- **CRUD Completo**: Crear, leer, actualizar y eliminar recetas
- **Categorías**: General, Comida, Cena, Picoteo, Dulce
- **Tiempos Detallados**: Preparación, cocción y total
- **Búsqueda Avanzada**: Por nombre, categoría o tiempo

### 📅 Generación Inteligente de Menús
- **Automática**: Menús semanales con recetas aleatorias
- **Manual**: Selector de recetas por día y comida
- **Visualización**: Menús desplegables con nombres personalizados
- **Flexibilidad**: Recetas "General" para comida y cena

### 📱 Diseño Móvil Optimizado
- **Responsive**: Adaptado a pantallas táctiles
- **Navegación tipo Instagram**: Bottom navigation para dispositivos móviles
- **Sistema de Routing**: Navegación SPA basada en hash (#/recetario, #/menus)
- **Colores Vibrantes**: Paleta de colores moderna y atractiva
- **Componentes Reutilizables**: Arquitectura de componentes modulares

### 💾 Almacenamiento Local Seguro
- **JSON Local**: Persistencia sin base de datos
- **Datos Persistentes**: Recetas y menús guardados
- **Sin Internet**: Funciona completamente offline

## 📋 Estructura del Proyecto

### Backend - Arquitectura Modular (Layered Architecture)
```
backend/
├── server.js              # Punto de entrada y bootstrap de repositorios
├── .windsurfrules         # Reglas de arquitectura para el agente backend
├── src/
│   ├── app.js             # Configuración Express y registro de rutas
│   ├── config/
│   │   └── index.js       # Configuración centralizada (puerto, host, etc.)
│   ├── recipes/           # Módulo Recetas (5 archivos obligatorios)
│   │   ├── recipe.entity.js       # Entidad, validate() y fromRequest()
│   │   ├── recipe.repository.js   # Extends JsonRepository
│   │   ├── recipe.service.js      # Lógica de negocio
│   │   ├── recipe.controller.js   # Handlers HTTP (solo delega)
│   │   └── recipe.routes.js       # Definición de rutas REST
│   ├── menus/             # Módulo Menús (mismo patrón de 5 archivos)
│   │   ├── menu.entity.js
│   │   ├── menu.repository.js
│   │   ├── menu.service.js
│   │   ├── menu.controller.js
│   │   └── menu.routes.js
│   └── shared/            # Utilidades compartidas
│       ├── errors/
│       │   └── AppError.js          # Clase de errores con código HTTP
│       ├── middleware/
│       │   └── errorHandler.js      # Middleware global de errores
│       └── repositories/
│           └── JsonRepository.js    # Clase base para persistencia JSON
└── data/
    ├── recipes.json       # Persistencia JSON de recetas
    └── menus.json         # Persistencia JSON de menús
```

### Frontend - Arquitectura ES6 Modules + SPA con Routing
```
frontend/
├── index.html             # SPA única (no se crean páginas adicionales)
├── css/
│   ├── styles.css         # Sistema de diseño: modales, filtros de categoría, etc.
│   └── theme.css          # Paleta de colores vibrante y variables CSS
├── components/            # Componentes reutilizables
│   ├── common/           # Componentes base (Button, Input, Select, Textarea)
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── Select.js
│   │   ├── Textarea.js
│   │   ├── SearchBar.js   # Barra de búsqueda con filtros
│   │   └── UnifiedModal.js # Sistema de modales genérico
│   ├── layout/           # Componentes de layout
│   │   └── BottomNavigation.js # Navegación tipo Instagram
│   ├── recipes/          # Componentes específicos de recetas
│   │   └── RecipeCard.js # Tarjeta unificada (grid/list/compact)
│   └── forms/            # Componentes de formulario
│       └── RecipeForm.js # Formulario unificado (create/edit)
├── pages/                # Páginas del SPA
│   ├── RecetarioPage.js  # Página de recetas
│   └── MenusPage.js      # Página de menús
├── .windsurfrules         # Reglas de arquitectura para el agente frontend
└── js/
    ├── app.js              # Coordinador principal: router, managers, init
    ├── config.js           # Constantes centralizadas (API_BASE, etc.)
    ├── apiService.js       # Único punto de salida HTTP (no fetch() directo)
    ├── utils.js            # Funciones puras: escapeHtml, showSuccess, showError
    ├── uiHelpers.js        # Generadores de HTML compartidos (badges, etc.)
    ├── tabManager.js       # Navegación por tabs
    ├── menuManager.js      # Gestión de menús semanales + sustitución de recetas
    ├── manualMenuManager.js # Creación manual de menús (grid 7 días)
    ├── core/
    │   ├── AppState.js     # Estado observable global (get/set/subscribe)
    │   └── Router.js      # Sistema de routing basado en hash
    ├── features/
    │   └── recipes/
    │       └── RecipeManager.js   # Manager de recetas (extiende BaseManager)
    └── shared/
        ├── BaseManager.js       # Clase base CRUD para managers
        └── utils.js             # Utilidades compartidas entre features
```

## 🛠️ Instalación Rápida

1. Instala Node.js si no lo tienes: https://nodejs.org/

2. Instala las dependencias:
```bash
npm install
```

## 🚀 Inicio Rápido

### 1. Iniciar el Servidor

```bash
npm start
```

O para desarrollo con recarga automática:
```bash
npm run dev
```

### 2. Acceso desde Dispositivos

**En tu computadora:**
- Abre: http://localhost:3000

**Desde móviles y tablets:**
1. Conecta a la misma red WiFi
2. Encuentra tu IP local:
   - **Windows**: `ipconfig` → busca "Dirección IPv4"
   - **Mac/Linux**: `ifconfig` o `ip addr`
3. Abre en el móvil: `http://[TU_IP]:3000`
   - Ejemplo: `http://192.168.1.100:3000`

### 3. Uso Básico

1. **Añade Recetas**: Crea tus recetas favoritas con tiempos y categorías
2. **Genera Menús**: Crea menús semanales automáticos o manuales
3. **Accede Móvil**: Usa el móvil para ver menús mientras cocinas

## 📱 Guía de Acceso Móvil

### Configuración Rápida
1. **Inicia el servidor**: `npm start`
2. **Obtén tu IP**: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
3. **Conecta el móvil**: A la misma WiFi
4. **Accede**: `http://TU_IP:3000`

### Troubleshooting Móvil
- **No carga**: Verifica misma red WiFi y servidor corriendo
- **Firewall**: Permite tráfico en puerto 3000
- **IP incorrecta**: Confirma tu dirección IPv4 local

## 🛠️ API Endpoints

### Recetas (`/api/recipes`)
- `GET /api/recipes` - Obtener todas las recetas
- `POST /api/recipes` - Crear nueva receta
- `PUT /api/recipes/:id` - Actualizar receta
- `DELETE /api/recipes/:id` - Eliminar receta

### Menús (`/api/menus`)
- `GET /api/menus` - Obtener todos los menús
- `POST /api/menus/generate` - Generar menú semanal
- `POST /api/menus` - Crear menú manual
- `PUT /api/menus/:id` - Actualizar menú
- `DELETE /api/menus/:id` - Eliminar menú

## Formato de Datos

### Receta
```json
{
  "id": "uuid",
  "name": "Nombre de la receta",
  "ingredients": "Ingrediente 1\nIngrediente 2\n...",
  "instructions": "Paso 1\nPaso 2\n...",
  "category": "general|comida|cena|picoteo|dulce",
  "prepTime": 15,
  "cookTime": 30,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Menú
```json
{
  "id": "uuid",
  "weekStart": "2024-01-01T00:00:00.000Z",
  "days": [
    {
      "date": "2024-01-01T00:00:00.000Z",
      "dayName": "Monday",
      "meals": {
        "breakfast": {
          "recipeId": "uuid",
          "recipeName": "Nombre de la receta"
        },
        "lunch": { ... },
        "dinner": { ... }
      }
    }
  ]
}
```

## Características Móviles

- Diseño responsive que se adapta a pantallas pequeñas
- Menú de navegación táctil
- Formularios optimizados para entrada móvil
- Sin necesidad de instalación (acceso web)

## Seguridad

- El servidor escucha en `0.0.0.0` para acceso en red local
- Validación básica de datos en el backend
- Escapado de HTML para prevenir XSS en el frontend

## 🔧 Arquitectura Técnica

### Patrón de Diseño Frontend
El frontend utiliza **ES6 Modules** con arquitectura modular y gestión de estado observable:

```
frontend/js/
├── app.js              # Coordinador principal, expone funciones globales
├── config.js           # Constantes centralizadas
├── apiService.js       # Servicio de API (único punto de salida HTTP)
├── core/
│   └── AppState.js     # Estado observable con get/set/subscribe
├── features/
│   └── recipes/
│       └── RecipeManager.js  # Extends BaseManager
├── shared/
│   ├── BaseManager.js  # Clase base con CRUD operations
│   ├── components/
│   │   ├── RecipeCard.js     # Componente reutilizable de tarjeta
│   │   ├── UnifiedModal.js   # Sistema de modales genérico
│   │   ├── SearchBar.js      # Barra de búsqueda con filtros
│   │   └── Modal.js          # Componente modal legacy
│   └── utils.js            # Utilidades compartidas
├── manualMenuManager.js
├── menuManager.js
├── tabManager.js
├── uiHelpers.js
└── utils.js
```

### Flujo de Datos
```
Usuario → Event Handler → Manager → ApiService → Backend
                             ↓                        ↓
UIHelpers ← AppState.get() ← ← ← ← ← ← ← ← ← ← ← JSON Response
                ↑
         AppState.set() → Notifica suscriptores
```

### Componentes Principales

#### 1. **RecipeManager** (extiende BaseManager)
Gestiona el ciclo completo de vida de las recetas usando AppState observable:
- `loadRecipes()`: Carga inicial desde API → `appState.set('recipes', data)`
- `renderRecipes()`: Renderizado grid, usa `appState.get('recipes')`
- `filterRecipes()`: Búsqueda por nombre/categoría/tiempo + filtros de categoría toggle
- `saveRecipe()`: Crear/actualizar con validación
- `deleteRecipe()`: Eliminación con confirmación
- `viewRecipe()`: Modal de visualización con instrucciones formateadas
- `editRecipe()`: Pre-carga datos en modal de edición
- `toggleCategoryFilter()`: Activa/desactiva filtros de categoría

#### 2. **MenuManager**
Gestiona menús semanales con visualización colapsable:
- `loadMenus()`: Carga menús con tracking de estado expandido (`appState.get('expandedMenus')`)
- `renderMenus()`: Genera HTML con nombres autonuméricos
- `renderDayCard()`: Tarjetas de día con comida/cena
- `renderMealCard()`: Visualización de receta en menú con 3 tiempos
- `generateMenu()`: Generación automática aleatoria
- `substituteRecipe()`: Cambio de receta con selector filtrable
- `toggleMenu()`: Expandir/colapsar menús
- `editName()`: Edición inline de nombre de menú

#### 3. **ManualMenuManager**
Flujo de creación manual paso a paso:
- `toggleForm()`: Mostrar/ocultar formulario
- `initGrid()`: Grid de 7 días con selección
- `openRecipeSelector()`: Modal de selección con filtros de categoría
- `renderRecipeSelector()`: Lista filtrada por tipo de comida + filtros toggle
- `selectRecipe()`: Asignación a slot específico
- `save()`: Persistencia del menú completo
- `clearMenu()`: Limpia formulario manual

#### 4. **BaseManager** (Clase Base)
Clase abstracta que proporciona operaciones CRUD base para managers:
- `loadItems()`: Carga datos desde API, usa `appState.set()`
- `saveItem()`: Crear/actualizar con validación
- `deleteItem()`: Eliminación con confirmación
- `resetForm()`: Limpia formulario
- `showAddModal()`: Muestra modal para añadir
- `closeModal()`: Cierra modal y limpia estado

#### 5. **RecipeCard** (Componente)
Componente reutilizable para mostrar recetas:
- `renderCompact()`: Vista compacta para selectores
- `renderGrid()`: Vista completa para grid
- Genera badges de tiempo y categoría automáticamente

### Modelo de Datos Completo

#### Recipe (Receta)
```typescript
interface Recipe {
  id: string;           // UUID v4
  name: string;         // Nombre de la receta
  category: "general" | "comida" | "cena" | "picoteo" | "dulce";
  prepTime: number;     // Tiempo preparación (minutos)
  cookTime: number;     // Tiempo cocción (minutos)
  ingredients: string;    // Separados por saltos de línea
  instructions: string;   // Separados por saltos de línea
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}
```

#### Menu (Menú Semanal)
```typescript
interface Menu {
  id: string;           // UUID v4
  name: string;         // "Menú generado X" o personalizado
  weekStart: string;    // ISO 8601 fecha inicio
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
  days: DayMenu[];      // Array de 7 días
}

interface DayMenu {
  date: string;         // ISO 8601 fecha específica
  dayName: string;      // "Lunes", "Martes", etc.
  meals: {
    comida?: Meal;      // Almuerzo (opcional)
    cena?: Meal;        // Cena (opcional)
  };
}

interface Meal {
  recipeId: string;     // Referencia a Recipe
  recipeName: string;   // Denormalizado para display
  prepTime: number;     // Denormalizado
  cookTime: number;     // Denormalizado
  totalTime: number;    // Calculado (prep + cook)
}
```

### Categorías y Reglas de Negocio

| Categoría | Icono | Color | Comida | Cena |
|-----------|-------|-------|--------|------|
| General | ☀️🌙 | Gris | ✅ | ✅ |
| Comida | ☀️ | Naranja | ✅ | ❌ |
| Cena | 🌙 | Índigo | ❌ | ✅ |
| Picoteo | 🍪 | Verde | ❌ | ❌ |
| Dulce | 🍬 | Rosa | ❌ | ❌ |

**Reglas de asignación automática:**
- Comida: Solo categorías `comida` y `general`
- Cena: Solo categorías `cena` y `general`
- Validación en frontend y backend

### Sistema de Tiempos

Cada receta almacena 3 tiempos:
1. **Prep** (🕐 Azul): Preparación antes de cocinar
2. **Cocción** (🔥 Naranja): Tiempo de cocción propiamente
3. **Total** (⏳ Verde): Suma automática (prep + cocción)

Visualización consistente en:
- Vista de recetas (grid)
- Modal de detalle
- Menús semanales (badges individuales)

### Gestión de Estado - AppState Observable

**AppState** es una clase observable que proporciona acceso reactivo al estado global:

```javascript
// Core: AppState.js
class AppState {
  constructor() {
    this.state = new Map();      // Almacena el estado
    this.subscribers = new Map(); // Callbacks por key
  }
  
  get(key) { return this.state.get(key); }
  
  set(key, value) {
    this.state.set(key, value);
    this.notify(key, value);  // Notifica suscriptores
  }
  
  subscribe(key, callback) {
    // Suscripción a cambios de estado
  }
}

// Uso en Managers:
const recipes = this.appState.get('recipes');
this.appState.set('recipes', updatedRecipes);
```

**Estado Global:**
```javascript
{
  recipes: [],              // Cache de recetas
  menus: [],                // Cache de menús
  expandedMenus: Set,       // IDs de menús expandidos
  editingRecipeId: null,    // ID en edición
  activeCategoryFilters: [], // Filtros toggle activos
  selectorCategoryFilters: [], // Filtros en selector modal
  // ... más estado según necesidad
}
```

### Responsive Design

**Breakpoints:**
- Mobile: < 640px (1 columna)
- Tablet: 640px - 1024px (2 columnas)
- Desktop: > 1024px (3+ columnas)

**Optimizaciones móviles:**
- Viewport: `width=device-width, initial-scale=1.0, maximum-scale=1.0`
- Botones mínimo 44x44px (área táctil)
- Inputs con padding aumentado
- Tarjetas con border-2 para mejor contraste
- Modales con scroll interno

### Seguridad Implementada

1. **XSS Prevention**: `escapeHtml()` sanitiza todos los outputs
2. **Input Validation**: Validación en backend para todos los endpoints
3. **CORS**: Configurado para acceso local
4. **No SQL Injection**: Uso de JSON files, no base de datos SQL

## 🛠️ Desarrollo

### Estructura del Código Frontend

```javascript
// 1. CONFIGURACIÓN
const CONFIG = { API_BASE, DAYS_OF_WEEK, MEAL_TYPES, VIEWS }
const CATEGORY_CONFIG = { /* definiciones visuales */ }

// 2. ESTADO (Observable)
import { AppState } from './core/AppState.js';
const appState = new AppState();
// appState.get('key'), appState.set('key', value), appState.subscribe('key', callback)

// 3. UTILIDADES
function escapeHtml(text) { /* sanitización */ }
function showNotification(msg, type) { /* feedback */ }

// 4. SERVICIO API
const ApiService = {
  request(endpoint, options),
  recipes: { getAll, create, update, delete },
  menus: { getAll, generate, create, update, delete }
}

// 5. MÓDULOS DE GESTIÓN
class BaseManager { /* Operaciones CRUD base */ }
class RecipeManager extends BaseManager { /* CRUD de recetas */ }
class MenuManager { /* Gestión de menús */ }
class ManualMenuManager { /* Menús manuales */ }
class TabManager { /* Navegación */ }

// 6. COMPONENTES
class RecipeCard { /* Componente reutilizable */ }

// 7. INICIALIZACIÓN
import { appState, recipeManager, menuManager } from './app.js';
```

### Convenciones de Código

- **Nombres**: camelCase para funciones/variables, PascalCase para módulos
- **Comentarios**: JSDoc para todas las funciones públicas
- **Eventos**: Delegación con data-attributes
- **HTML**: Template strings con escapeHtml obligatorio
- **CSS**: Tailwind classes, custom classes solo cuando necesario

### Extensión del Proyecto

Para añadir nuevas funcionalidades:

**Nueva categoría de receta:**
1. Añadir a `CATEGORY_CONFIG` en app.js
2. Añadir option en index.html (forms)
3. Actualizar reglas de asignación si aplica

**Nuevo campo en receta:**
1. Añadir input en formularios HTML (`index.html`)
2. Añadir a `recipeData` en `RecipeManager.saveRecipe()`
3. Actualizar `recipe.entity.js` en backend
4. Mostrar en `RecipeManager.renderRecipeDetails()`
5. Actualizar modelo en este README

**Nuevo endpoint API:**
1. Añadir ruta en `backend/src/<module>/<module>.routes.js`
2. Implementar controller en `<module>.controller.js`
3. Añadir lógica en `<module>.service.js`
4. Añadir método en `frontend/js/apiService.js`
5. Crear manager function que lo use
6. Conectar a UI event handler

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

---

## 📊 Performance

### Optimizaciones Implementadas
- **Lazy loading**: Menús colapsables renderizan solo al expandir
- **Debouncing**: Búsqueda en tiempo real sin exceso de renders
- **Caching**: AppState mantiene datos en memoria
- **Virtual scrolling**: Implementado para listas grandes
- **Code splitting**: Carga de componentes solo cuando necesario

### Métricas Esperadas
- **First Paint**: < 1s en conexión local
- **Time to Interactive**: < 2s
- **Bundle Size**: ~20KB (sin imágenes)
- **Memory Usage**: < 50MB para 1000 recetas
