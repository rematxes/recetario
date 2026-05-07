---
description: Añadir nuevo componente reutilizable (common, layout, recipes, forms)
---

# Workflow: Añadir nuevo componente reutilizable

Antes de empezar, determina el tipo de componente:
- `common` — Componentes base (Button, Input, Select, Textarea, etc.)
- `layout` — Componentes de layout (BottomNavigation, Header, etc.)
- `recipes` — Componentes específicos de recetas
- `forms` — Componentes de formulario

## Paso 1 — Determinar el tipo y ubicación

Elige la carpeta correcta según el tipo:
- `frontend/components/common/` — Componentes base genéricos
- `frontend/components/layout/` — Componentes de layout
- `frontend/components/recipes/` — Componentes específicos de recetas
- `frontend/components/forms/` — Componentes de formulario

## Paso 2 — Crear el archivo del componente

Crear `frontend/components/<tipo>/<Componente>.js`:

```js
/**
 * ============================================
 * <COMPONENTE> COMPONENT
 * ============================================
 * 
 * Descripción del componente
 */

export class <Componente> {
  constructor(options = {}) {
    // Propiedades del componente
    this.prop1 = options.prop1 || default;
    this.prop2 = options.prop2 || default;
  }

  render() {
    // Renderizar el componente como HTML string
    return `<!-- HTML del componente -->`;
  }

  // Otros métodos según necesidad
}

export const create<Componente> = (options) => new <Componente>(options);
```

## Paso 3 — Patrones según tipo

### Componente Common (Button, Input, etc.)

- Recibir props: `type`, `placeholder`, `value`, `required`, `disabled`, `class`, `onchange`
- Exportar clase y función factory `create*Component()`
- Usar Tailwind CSS para estilos

### Componente Layout (BottomNavigation, Header)

- Recibir configuración de navegación o elementos
- Renderizar estructura de layout
- Manejar estado de navegación si es necesario

### Componente Recipes (RecipeCard)

- Recibir datos de receta y opciones de visualización
- Soportar múltiples vistas (grid, list, compact)
- Manejar eventos (onView, onEdit, onDelete, onSelect)

### Componente Forms (RecipeForm)

- Recibir modo (create/edit) y datos iniciales
- Renderizar formulario completo
- Proporcionar métodos para obtener/limpiar datos

## Paso 4 — Usar el componente

En el archivo donde se use:

```js
import { <Componente>, create<Componente> } from '../components/<tipo>/<Componente>.js';

// Opción 1: Instancia directa
const componente = new <Componente>({ prop1: valor });
container.innerHTML = componente.render();

// Opción 2: Factory function
const componente = create<Componente>({ prop1: valor });
container.innerHTML = componente.render();
```

## Paso 5 — Exponer globalmente (si es necesario)

Si el componente se usa desde HTML con `onclick`:

1. Añadir import en `frontend/js/app.js`
2. Exponer en `window`:
```js
import { create<Componente> } from '../components/<tipo>/<Componente>.js';
window.create<Componente> = create<Componente>;
```
