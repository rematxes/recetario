# Definición de Aplicación: Control de Gastos y Presupuestos Familiar

## 1. Resumen Ejecutivo

**Nombre de la aplicación:** *(pendiente de definir)*

**Propósito:** Aplicación para el seguimiento, categorización y control de gastos familiares, permitiendo establecer presupuestos por categorías y visualizar el estado financiero de la familia.

**Público objetivo:** Familias que desean controlar sus gastos de manera organizada.

---

## 2. Requisitos Funcionales

### 2.1 Gestión de Gastos (CRUD)
- [ ] **RF-1.1** - Crear nuevo gasto con: descripción, importe, fecha, categoría, método de pago, notas opcionales
- [ ] **RF-1.2** - Listar todos los gastos con filtros y ordenación
- [ ] **RF-1.3** - Editar gasto existente
- [ ] **RF-1.4** - Eliminar gasto
- [ ] **RF-1.5** - Duplicar gasto (para gastos recurrentes similares)

### 2.2 Categorías de Gastos
- [ ] **RF-2.1** - Crear categorías personalizadas (nombre, color, icono opcional)
- [ ] **RF-2.2** - Editar categorías existentes
- [ ] **RF-2.3** - Eliminar categorías (con manejo de gastos asociados)
- [ ] **RF-2.4** - Categorías sugeridas por defecto: Comida, Imprevistos, Colegio/Escuela, Ocio, Vivienda, Transporte, Salud, Servicios

### 2.3 Presupuestos
- [ ] **RF-3.1** - Establecer presupuesto mensual por categoría
- [ ] **RF-3.2** - Establecer presupuesto total mensual
- [ ] **RF-3.3** - Alertas cuando se acerca el límite de presupuesto (ej: 80%, 100%)
- [ ] **RF-3.4** - Visualizar estado de presupuesto (usado vs. total)

### 2.4 Filtros y Búsquedas
- [ ] **RF-4.1** - Filtrar por categoría
- [ ] **RF-4.2** - Filtrar por rango de fechas
- [ ] **RF-4.3** - Filtrar por importe (mínimo, máximo, rango)
- [ ] **RF-4.4** - Filtrar por método de pago
- [ ] **RF-4.5** - Búsqueda por texto en descripción
- [ ] **RF-4.6** - Combinar múltiples filtros

### 2.5 Visualización y Reportes
- [ ] **RF-5.1** - Dashboard resumen mensual (total gastado, presupuesto restante)
- [ ] **RF-5.2** - Gráfico de gastos por categoría (torta/barras)
- [ ] **RF-5.3** - Gráfico de evolución temporal (línea)
- [ ] **RF-5.4** - Listado de mayores gastos
- [ ] **RF-5.5** - Exportar datos a CSV/JSON

### 2.6 Gestión de Períodos
- [ ] **RF-6.1** - Vista mensual (por defecto)
- [ ] **RF-6.2** - Vista anual
- [ ] **RF-6.3** - Comparar meses o períodos

---

## 3. Requisitos No Funcionales

- [ ] **RNF-1** - Interfaz responsive (desktop y móvil)
- [ ] **RNF-2** - Persistencia de datos local (JSON)
- [ ] **RNF-3** - Sin autenticación (uso familiar local)
- [ ] **RNF-4** - Tiempo de respuesta < 1 segundo para operaciones CRUD
- [ ] **RNF-5** - Código modular y mantenible

---

## 4. Modelos de Datos (Entidades)

### 4.1 Expense (Gasto)
```javascript
{
  id: UUID,              // Generado automáticamente
  description: String,    // Descripción del gasto
  amount: Number,        // Importe (positivo)
  date: ISO Date,        // Fecha del gasto
  categoryId: UUID,      // Referencia a categoría
  paymentMethod: String, // Efectivo, Tarjeta, Transferencia, etc.
  notes: String,       // Opcional
  createdAt: ISO Date, // Automático
  updatedAt: ISO Date  // Automático
}
```

### 4.2 Category (Categoría)
```javascript
{
  id: UUID,           // Generado automáticamente
  name: String,       // Nombre de la categoría
  color: String,      // Código hexadecimal (#RRGGBB)
  icon: String,       // Opcional: nombre de icono
  isDefault: Boolean, // true si es categoría del sistema
  createdAt: ISO Date,
  updatedAt: ISO Date
}
```

### 4.3 Budget (Presupuesto)
```javascript
{
  id: UUID,              // Generado automáticamente
  categoryId: UUID|null, // null = presupuesto total
  amount: Number,       // Importe mensual asignado
  month: Number,        // 1-12
  year: Number,         // Año
  alertThreshold: Number, // Porcentaje para alerta (ej: 80)
  createdAt: ISO Date,
  updatedAt: ISO Date
}
```

---

## 5. Arquitectura Técnica (Propuesta)

Basada en la arquitectura del **Weekly Menu Manager**:

### 5.1 Estructura de Carpetas

```
 proyecto/
 ├── backend/
 │   ├── server.js                 // Bootstrap
 │   ├── src/
 │   │   ├── app.js               // Express app
 │   │   ├── config.js            // Configuración
 │   │   ├── expenses/            // Entidad: Gastos
 │   │   │   ├── expense.entity.js
 │   │   │   ├── expense.repository.js
 │   │   │   ├── expense.service.js
 │   │   │   ├── expense.controller.js
 │   │   │   └── expense.routes.js
 │   │   ├── categories/          // Entidad: Categorías
 │   │   │   ├── category.entity.js
 │   │   │   ├── category.repository.js
 │   │   │   ├── category.service.js
 │   │   │   ├── category.controller.js
 │   │   │   └── category.routes.js
 │   │   ├── budgets/             // Entidad: Presupuestos
 │   │   │   ├── budget.entity.js
 │   │   │   ├── budget.repository.js
 │   │   │   ├── budget.service.js
 │   │   │   ├── budget.controller.js
 │   │   │   └── budget.routes.js
 │   │   └── shared/
 │   │       ├── repositories/
 │   │       │   └── JsonRepository.js  // Reutilizable
 │   │       ├── middleware/
 │   │       │   └── errorHandler.js
 │   │       └── errors/
 │   └── data/
 │       ├── expenses.json
 │       ├── categories.json
 │       └── budgets.json
 └── frontend/
     ├── index.html               // SPA única
     ├── css/
     └── js/
         ├── config.js            // CONFIG.API_BASE
         ├── apiService.js        // Comunicación backend
         ├── app.js               // Inicialización
         ├── core/                // Utilidades core
         ├── shared/              // Componentes compartidos
         └── features/
             ├── expenses/
             │   └── ExpenseManager.js
             ├── categories/
             │   └── CategoryManager.js
             ├── budgets/
             │   └── BudgetManager.js
             └── dashboard/
                 └── DashboardManager.js
```

### 5.2 Backend (Node.js + Express)

| Aspecto | Decisión |
|---------|----------|
| **Módulos** | CommonJS (`require` / `module.exports`) |
| **Persistencia** | JSON files vía `JsonRepository` |
| **IDs** | UUID generados por `JsonRepository.create()` |
| **Timestamps** | Gestionados por `JsonRepository` |
| **Rutas API** | `/api/expenses`, `/api/categories`, `/api/budgets` |
| **Servidor** | `0.0.0.0:3000` (configurable) |

#### Patrón por Entidad (Backend)
- **Entity**: Validación de datos y estructura
- **Repository**: Acceso a datos (extiende `JsonRepository`)
- **Service**: Lógica de negocio, validaciones complejas
- **Controller**: HTTP request/response handling
- **Routes**: Definición de endpoints

### 5.3 Frontend (SPA ES6)

| Aspecto | Decisión |
|---------|----------|
| **Módulos** | ES6 (`import` / `export`) |
| **Arquitectura** | Feature-based modules |
| **Comunicación** | `ApiService` (único punto de fetch) |
| **UI** | Vanilla JS + CSS (o framework a definir) |
| **Config** | `CONFIG.API_BASE` en `config.js` |

### 5.4 Flujo de Datos

```
Frontend (Manager) → apiService.js → Backend API → Controller → Service → Repository → JSON File
```

### 5.5 Separación de Responsabilidades

| Capa | Responsabilidad |
|------|-----------------|
| **Controller** | Recibir petición HTTP, extraer parámetros, devolver response |
| **Service** | Lógica de negocio, validaciones, cálculos, agregaciones |
| **Repository** | Persistencia, CRUD básico, timestamps |
| **Entity** | Estructura de datos, validación básica |

---

## 6. Endpoints API (Propuesta)

### Gastos (`/api/expenses`)
- `GET /` - Listar todos (con query params para filtros)
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar

### Categorías (`/api/categories`)
- `GET /` - Listar todas
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar

### Presupuestos (`/api/budgets`)
- `GET /` - Listar (con query: month, year)
- `GET /:id` - Obtener por ID
- `POST /` - Crear/Actualizar
- `DELETE /:id` - Eliminar

### Reportes (`/api/reports`)
- `GET /summary?month=&year=` - Resumen mensual
- `GET /by-category?month=&year=` - Gastos agrupados por categoría
- `GET /timeline?start=&end=` - Evolución temporal

---

## 7. Wireframes / UI (Opcional)

*(Espacio para describir o enlazar mockups de la interfaz)*

### Pantallas sugeridas:
1. **Dashboard** - Vista resumen con gráficos y estadísticas
2. **Lista de Gastos** - Tabla con filtros y acciones
3. **Formulario de Gasto** - Crear/editar gasto
4. **Categorías** - Grid de categorías con colores
5. **Presupuestos** - Configuración de límites mensuales

---

## 8. Decisiones Pendientes

| Decisión | Opciones | Estado |
|----------|----------|--------|
| Nombre de la app | *(a definir)* | ⏳ Pendiente |
| Frontend framework | Vanilla JS / React / Vue / Otra | ⏳ Pendiente |
| Librería de gráficos | Chart.js / D3 / Otra | ⏳ Pendiente |
| UI Framework | CSS puro / Bootstrap / Tailwind | ⏳ Pendiente |
| Iconos | Lucide / FontAwesome / SVG | ⏳ Pendiente |

---

## 9. Roadmap / Fases de Implementación

### Fase 1: Core
- [ ] Configuración proyecto (backend + frontend)
- [ ] Entidad Categoría (CRUD completo)
- [ ] Entidad Gasto (CRUD completo)
- [ ] Lista básica de gastos con filtros simples

### Fase 2: Funcionalidad
- [ ] Entidad Presupuesto
- [ ] Dashboard resumen
- [ ] Filtros avanzados
- [ ] Gráficos básicos

### Fase 3: Refinamiento
- [ ] Alertas de presupuesto
- [ ] Exportar datos
- [ ] UI/UX polish
- [ ] Tests

---

## Notas y Comentarios

*(Espacio para apuntes adicionales)*

