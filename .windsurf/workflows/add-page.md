---
description: Añadir nueva página al SPA con routing
---

# Workflow: Añadir nueva página al SPA

Antes de empezar, reemplaza `<pagina>` por el nombre en minúscula (ej. `settings`) y `<Pagina>` por el nombre en PascalCase (ej. `Settings`).

## Paso 1 — Crear el archivo de la página

Crear `frontend/pages/<Pagina>Page.js`:

```js
/**
 * ============================================
 * <PAGINA> PAGE
 * ============================================
 * 
 * Página para <descripción>
 */

import { appState } from '../../js/core/AppState.js';
// Importar managers necesarios
// import { <Manager> } from '../../js/features/<entidad>/<Manager>.js';

export class <Pagina>Page {
  constructor(appState, /* managers necesarios */) {
    this.appState = appState;
    // this.<manager> = <manager>;
  }

  init() {
    console.log('[<Pagina>Page] Initializing...');
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    // Configurar event listeners para formularios, botones, etc.
    // document.getElementById('<id>')?.addEventListener('event', (e) => { ... });
  }

  render() {
    // Lógica de renderizado inicial
    // this.<manager>.loadItems();
  }
}
```

## Paso 2 — Registrar la página en app.js

Editar `frontend/js/app.js`:

1. Añadir import:
```js
import { <Pagina>Page } from '../pages/<Pagina>Page.js';
```

2. Instanciar la página:
```js
const <pagina>Page = new <Pagina>Page(appState, /* managers necesarios */);
```

3. Registrar la ruta en el router:
```js
router.register('<pagina>', () => {
  const <pagina>Tab = document.getElementById('<pagina>-tab');
  <pagina>Tab.classList.remove('hidden');
  // Ocultar otras tabs si es necesario
  <pagina>Page.init();
  updateBottomNavigation('<pagina>');
});
```

## Paso 3 — Añadir sección en index.html

Editar `frontend/index.html`:

1. Añadir sección `<section id="<pagina>-tab">` con el contenido de la página:
```html
<section id="<pagina>-tab" class="hidden">
  <!-- Contenido de la página -->
</section>
```

2. La sección debe estar oculta por defecto (clase `hidden`).

## Paso 4 — Añadir navegación a la página

Opción A: BottomNavigation (móvil)

Editar la configuración de BottomNavigation en `app.js`:

```js
const bottomNav = createBottomNavigation([
  // ... items existentes
  {
    icon: 'fas fa-<icono>',
    label: '<Nombre>',
    active: false,
    onClick: "router.navigate('<pagina>')"
  }
]);
```

Opción B: Botón en el HTML

Añadir un botón en `index.html`:
```html
<button onclick="router.navigate('<pagina>')"><Nombre></button>
```

## Paso 5 — Manejar la navegación

La página se mostrará automáticamente cuando el hash cambie a `#/<pagina>`. El router llamará a `<pagina>Page.init()` automáticamente.

Si necesitas mostrar/ocultar manualmente la sección, puedes hacerlo en el método `init()`:

```js
init() {
  console.log('[<Pagina>Page] Initializing...');
  
  // Ocultar todas las secciones
  document.querySelectorAll('section[id$="-tab"]').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Mostrar esta sección
  document.getElementById('<pagina>-tab').classList.remove('hidden');
  
  this.setupEventListeners();
  this.render();
}
```
