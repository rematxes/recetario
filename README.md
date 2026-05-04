# Gestor de Recetas y Menús Semanales

Una aplicación web CRUD para gestionar recetas y generar menús semanales automáticamente. **Accesible desde dispositivos móviles en la misma red WiFi.**

## 🚀 Características Principales

### 🍳 Gestión Completa de Recetas
- **CRUD Completo**: Crear, leer, actualizar y eliminar recetas
- **Categorías**: General, Desayuno, Comida, Cena, Picoteo, Dulce
- **Tiempos Detallados**: Preparación, cocción y total
- **Búsqueda Avanzada**: Por nombre, categoría o tiempo

### 📅 Generación Inteligente de Menús
- **Automática**: Menús semanales con recetas aleatorias
- **Manual**: Selector de recetas por día y comida
- **Visualización**: Menús desplegables con nombres personalizados
- **Flexibilidad**: Recetas "General" para comida y cena

### 📱 Diseño Móvil Optimizado
- **Responsive**: Adaptado a pantallas táctiles
- **Navegación Intuitiva**: Botones optimizados para dedos
- **Acceso WiFi**: Disponible en toda la red local
- **Sin Zoom Forzado**: Experiencia móvil nativa

### 💾 Almacenamiento Local Seguro
- **JSON Local**: Persistencia sin base de datos
- **Datos Persistentes**: Recetas y menús guardados
- **Sin Internet**: Funciona completamente offline

## 📋 Estructura del Proyecto

```
windsurf-project/
├── backend/
│   ├── server.js          # Servidor Node.js/Express
│   └── data/              # Directorio de datos JSON
│       ├── recipes.json   # Base de datos de recetas
│       └── menus.json     # Base de datos de menús
├── frontend/
│   ├── index.html         # Interfaz principal (responsive)
│   └── app.js            # Lógica del frontend
├── DEPLOYMENT.md          # Guía completa de despliegue
├── package.json           # Dependencias del proyecto
└── README.md             # Este archivo
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
  "description": "Descripción opcional",
  "ingredients": "Ingrediente 1\nIngrediente 2\n...",
  "instructions": "Paso 1\nPaso 2\n...",
  "category": "general|breakfast|lunch|dinner|dessert",
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

### Patrón de Diseño
El frontend utiliza el **Module Pattern** con una arquitectura clara de separación de responsabilidades:

```
frontend/app.js
├── CONFIG              # Constantes y configuración
├── AppState           # Estado global de la aplicación
├── Utility Functions  # Funciones auxiliares
├── ApiService         # Capa de acceso a datos
├── UIHelpers          # Generadores de HTML
├── RecipeManager      # Gestión de recetas (CRUD)
├── MenuManager        # Gestión de menús semanales
├── ManualMenuManager  # Creación manual de menús
├── TabManager         # Navegación entre pestañas
└── Initialization     # Punto de entrada
```

### Flujo de Datos
```
Usuario → Event Handler → Manager → ApiService → Backend
                                           ↓
UIHelpers ← AppState ← ← ← ← ← ← ← ← ← ← ← JSON Response
```

### Componentes Principales

#### 1. **RecipeManager**
Gestiona el ciclo completo de vida de las recetas:
- `loadRecipes()`: Carga inicial desde API
- `renderRecipes()`: Renderizado condicional (grid/lista)
- `filterRecipes()`: Búsqueda por nombre/descripción/categoría/tiempo
- `saveRecipe()`: Crear/actualizar con validación
- `deleteRecipe()`: Eliminación con confirmación
- `viewRecipe()`: Modal de visualización detallada
- `editRecipe()`: Modal de edición con pre-carga

#### 2. **MenuManager**
Gestiona menús semanales con visualización colapsable:
- `loadMenus()`: Carga menús con tracking de estado expandido
- `renderMenus()`: Genera HTML con nombres autonuméricos
- `renderDayCard()`: Tarjetas de día con comida/cena
- `renderMealCard()**: Visualización de receta en menú con 3 tiempos
- `generateMenu()**: Generación automática aleatoria
- `substituteRecipe()**: Cambio de receta con filtros de categoría
- `toggleMenu()**: Expandir/colapsar menús
- `editName()**: Edición inline de nombre de menú

#### 3. **ManualMenuManager**
Flujo de creación manual paso a paso:
- `toggleForm()**: Mostrar/ocultar formulario
- `initGrid()**: Grid de 7 días con selección
- `openRecipeSelector()**: Modal de selección con filtros
- `renderRecipeSelector()**: Lista filtrada por tipo de comida
- `selectRecipe()**: Asignación a slot específico
- `save()**: Persistencia del menú completo

### Modelo de Datos Completo

#### Recipe (Receta)
```typescript
interface Recipe {
  id: string;           // UUID v4
  name: string;         // Nombre de la receta
  description: string;  // Descripción breve
  category: "general" | "desayuno" | "comida" | "cena" | "picoteo" | "dulce";
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
| Desayuno | ☕ | Amarillo | ❌ | ❌ |
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
- Vista de recetas (grid/lista)
- Modal de detalle
- Menús semanales (badges individuales)

### Gestión de Estado

**AppState** centraliza el estado:
```javascript
AppState = {
  recipes: [],           // Cache de recetas
  menus: [],             // Cache de menús
  currentView: 'grid',     // 'grid' | 'list'
  expandedMenus: Set,    // IDs de menús expandidos
  editingRecipeId: null, // ID en edición
  manualMenuForm: {      // Estado form manual
    isExpanded: false,
    selectedDay: null,
    selectedMeal: null,
    selectorViewMode: 'grid',
    data: {}             // Datos temporales
  }
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

// 2. ESTADO
const AppState = { /* estado global */ }

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
const RecipeManager = { /* CRUD de recetas */ }
const MenuManager = { /* Gestión de menús */ }
const ManualMenuManager = { /* Menús manuales */ }
const TabManager = { /* Navegación */ }

// 6. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', initApp)
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
1. Añadir input en formularios HTML
2. Añadir a `recipeData` en `saveRecipe()`
3. Mostrar en `viewRecipe()` y renderizados
4. Actualizar modelo en este README

**Nuevo endpoint API:**
1. Añadir ruta en `backend/server.js`
2. Añadir método en `ApiService`
3. Crear manager function que lo use
4. Conectar a UI event handler

## 📊 Performance

### Optimizaciones Implementadas
- **Lazy loading**: Menús colapsables renderizan solo al expandir
- **Debouncing**: Búsqueda en tiempo real sin exceso de renders
- **Caching**: AppState mantiene datos en memoria
- **Virtual scrolling**: No implementado (lista < 1000 items)

### Métricas Esperadas
- **First Paint**: < 1s en conexión local
- **Time to Interactive**: < 2s
- **Bundle Size**: ~20KB (sin imágenes)
- **Memory Usage**: < 50MB para 1000 recetas
