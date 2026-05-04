---
description: Añadir nueva entidad CRUD completa (backend + frontend) respetando la arquitectura del proyecto
---

# Workflow: Añadir nueva entidad CRUD completa

Antes de empezar, reemplaza `<entidad>` por el nombre en minúscula (ej. `ingredient`) y `<Entidad>` por el nombre en PascalCase (ej. `Ingredient`).

## Paso 1 — Backend: Entity

Crear `backend/src/<entidad>/<entidad>.entity.js` con esta estructura:

```js
const class <Entidad> {
  constructor(data) {
    this.id = data.id;
    // ...campos de la entidad
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static validate(data) {
    const errors = [];
    // validar campos obligatorios
    return errors;
  }

  static fromRequest(data) {
    return {
      // normalizar y sanitizar campos del body HTTP
    };
  }
}

module.exports = { <Entidad> };
```

- No asignar `id`, `createdAt` ni `updatedAt` aquí.
- `validate()` retorna array de strings (vacío = sin errores).
- `fromRequest()` hace trim y castings necesarios.

## Paso 2 — Backend: Repository

Crear `backend/src/<entidad>/<entidad>.repository.js`:

```js
const JsonRepository = require('../shared/repositories/JsonRepository');
const path = require('path');

const FILE_PATH = path.join(__dirname, '..', '..', 'data', '<entidad>s.json');

class <Entidad>Repository extends JsonRepository {
  constructor() {
    super(FILE_PATH);
  }

  // Añadir métodos de consulta específicos si hacen falta
  // Usar this.filter(fn) para búsquedas
}

module.exports = new <Entidad>Repository();
```

## Paso 3 — Backend: Service

Crear `backend/src/<entidad>/<entidad>.service.js`:

```js
const <entidad>Repository = require('./<entidad>.repository');
const { <Entidad> } = require('./<entidad>.entity');
const AppError = require('../shared/errors/AppError');

class <Entidad>Service {
  async create(data) {
    const entityData = <Entidad>.fromRequest(data);
    const errors = <Entidad>.validate(entityData);
    if (errors.length > 0) throw new AppError(errors.join(', '), 400);
    return <entidad>Repository.create(entityData);
  }

  async getAll() {
    return <entidad>Repository.readAll();
  }

  async getById(id) {
    const item = await <entidad>Repository.findById(id);
    if (!item) throw new AppError('<Entidad> not found', 404);
    return item;
  }

  async update(id, data) {
    await this.getById(id);
    const entityData = <Entidad>.fromRequest(data);
    const errors = <Entidad>.validate(entityData);
    if (errors.length > 0) throw new AppError(errors.join(', '), 400);
    return <entidad>Repository.update(id, entityData);
  }

  async delete(id) {
    await this.getById(id);
    return <entidad>Repository.delete(id);
  }
}

module.exports = new <Entidad>Service();
```

## Paso 4 — Backend: Controller

Crear `backend/src/<entidad>/<entidad>.controller.js`:

```js
const <entidad>Service = require('./<entidad>.service');

class <Entidad>Controller {
  async create(req, res, next) {
    try {
      const item = await <entidad>Service.create(req.body);
      res.status(201).json(item);
    } catch (error) { next(error); }
  }

  async getAll(req, res, next) {
    try {
      const items = await <entidad>Service.getAll();
      res.json(items);
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const item = await <entidad>Service.getById(req.params.id);
      res.json(item);
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const item = await <entidad>Service.update(req.params.id, req.body);
      res.json(item);
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      await <entidad>Service.delete(req.params.id);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}

module.exports = new <Entidad>Controller();
```

## Paso 5 — Backend: Routes

Crear `backend/src/<entidad>/<entidad>.routes.js`:

```js
const express = require('express');
const router = express.Router();
const <entidad>Controller = require('./<entidad>.controller');

router.get('/', (req, res, next) => <entidad>Controller.getAll(req, res, next));
router.post('/', (req, res, next) => <entidad>Controller.create(req, res, next));
router.get('/:id', (req, res, next) => <entidad>Controller.getById(req, res, next));
router.put('/:id', (req, res, next) => <entidad>Controller.update(req, res, next));
router.delete('/:id', (req, res, next) => <entidad>Controller.delete(req, res, next));

module.exports = router;
```

## Paso 6 — Backend: Registrar rutas en app.js

Editar `backend/src/app.js`, añadir ANTES del middleware de archivos estáticos:

```js
const <entidad>Routes = require('./<entidad>/<entidad>.routes');
// ...
app.use('/api/<entidad>s', <entidad>Routes);
```

## Paso 7 — Backend: Registrar en server.js

Editar `backend/server.js`, siguiendo el patrón de `recipeRepo` y `menuRepo`:

```js
const ENTIDAD_FILE = path.join(__dirname, 'data', '<entidad>s.json');
// en bootstrap():
const <entidad>Repo = new JsonRepository(ENTIDAD_FILE);
await <entidad>Repo.ensureFile();
```

## Paso 8 — Frontend: Añadir métodos en apiService.js

Editar `frontend/js/apiService.js`, añadir al final de la clase `ApiService`:

```js
async getAll<Entidad>s() {
  return this.request('/api/<entidad>s');
}

async create<Entidad>(data) {
  return this.request('/api/<entidad>s', { method: 'POST', body: JSON.stringify(data) });
}

async update<Entidad>(id, data) {
  return this.request(`/api/<entidad>s/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

async delete<Entidad>(id) {
  return this.request(`/api/<entidad>s/${id}`, { method: 'DELETE' });
}
```

## Paso 9 — Frontend: Crear el Manager

Crear `frontend/js/features/<entidad>/<Entidad>Manager.js`:

```js
import { apiService } from '../../apiService.js';
import { showSuccess, showError } from '../../utils.js';

export class <Entidad>Manager {
  constructor(appState) {
    this.appState = appState;
    this.items = [];
  }

  async loadItems() {
    try {
      this.items = await apiService.getAll<Entidad>s();
      this.appState.set('<entidad>s', this.items);
      this.render();
    } catch (error) {
      showError('Error al cargar <entidad>s');
    }
  }

  render() {
    const container = document.getElementById('<entidad>s-container');
    if (!container) return;
    const items = this.appState.get('<entidad>s') || [];
    container.innerHTML = items.map(item => this.renderItem(item)).join('');
  }

  renderItem(item) {
    return `<div class="...">${item.name}</div>`;
  }

  async save(e) {
    e.preventDefault();
    // extraer datos del formulario y llamar a apiService.create<Entidad>()
  }

  async delete(id) {
    try {
      await apiService.delete<Entidad>(id);
      await this.loadItems();
      showSuccess('<Entidad> eliminada');
    } catch (error) {
      showError('Error al eliminar <entidad>');
    }
  }
}
```

## Paso 10 — Frontend: Registrar el Manager en app.js

Editar `frontend/js/app.js`:

1. Añadir import: `import { <Entidad>Manager } from './features/<entidad>/<Entidad>Manager.js';`
2. Instanciar: `const <entidad>Manager = new <Entidad>Manager(appState);`
3. Añadir funciones globales necesarias y exponerlas en `window`.
4. Llamar a `<entidad>Manager.loadItems()` en `initApp()` si es necesario.

## Paso 11 — Frontend: Añadir sección en index.html

Editar `frontend/index.html`:

1. Añadir botón de tab en la barra de navegación (siguiendo el patrón de `showTab('recipes')` / `showTab('menus')`).
2. Añadir sección `<section id="<entidad>s-tab">` con formulario y contenedor de lista.
3. El tab debe ocultarse/mostrarse con las clases CSS `hidden` / `active` gestionadas por `TabManager`.
