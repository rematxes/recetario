---
description: Diagnosticar y corregir bugs respetando la separación de capas de la arquitectura
---

# Workflow: Depurar errores por capas

Este workflow guía el diagnóstico sistemático de bugs desde la capa de UI hasta la persistencia en JSON, evitando workarounds en capas incorrectas.

## Paso 1 — Identificar la capa afectada

Determina dónde está el síntoma del bug:

| Síntoma | Capa probable |
|---|---|
| La UI no muestra datos o muestra datos incorrectos | Frontend — Render |
| Los datos cambian en un sitio pero no se reflejan en otro | Frontend — AppState |
| El formulario envía pero no pasa nada / aparece error de red | Frontend → Backend (HTTP) |
| El servidor responde con error 4xx o 5xx | Backend — Controller / Service |
| Los datos no se guardan o se corrompen en el JSON | Backend — Repository / Persistencia |

## Paso 2 — Frontend: Capa de Render (UI)

Si la UI no muestra lo que debería:

1. Abrir DevTools → Console. Buscar errores JS.
2. Verificar que el contenedor HTML existe: `document.getElementById('<id-del-contenedor>')` devuelve un elemento.
3. Comprobar que el método `render()` del Manager afectado se está llamando. Añadir `console.log` temporal al inicio de `render()`.
4. Verificar que `appState.get('<clave>')` devuelve el array/objeto esperado con datos reales.
5. Si `appState.get()` devuelve datos pero la UI no los muestra, el bug está en el template literal de `renderItem()`.

**Fix correcto**: en el método `render()` o `renderItem()` del Manager. No modificar el Service ni el Controller para compensar un bug de render.

## Paso 3 — Frontend: Capa de Estado (AppState)

Si los datos no se propagan correctamente entre componentes:

1. Añadir `console.log` en el `set()` que debería actualizar el estado: `appState.set('<clave>', datos)`.
2. Verificar que la clave usada en `set()` y en `get()` es exactamente la misma.
3. Comprobar suscriptores: si un Manager se suscribe a cambios de estado, verificar que el callback está registrado con `appState.subscribe('<clave>', fn)` antes de que se produzca el `set()`.
4. Si el estado se actualiza pero el render no se dispara, verificar que el Manager tiene suscriptores registrados o que llama a `render()` explícitamente tras `loadItems()`.

**Fix correcto**: en `AppState.js` o en la lógica de suscripción del Manager. No duplicar estado en variables locales para compensar.

## Paso 4 — Frontend → Backend: Capa HTTP

Si el formulario envía pero no hay respuesta o hay error de red:

1. Abrir DevTools → Network. Filtrar por XHR/Fetch.
2. Verificar la petición saliente:
   - **Método**: GET, POST, PUT, DELETE correcto
   - **URL**: `http://localhost:3000/api/<entidad>` — sin errores de tipeo, sin doble slash
   - **Headers**: `Content-Type: application/json` presente
   - **Body**: JSON válido (copiar y pegar en `JSON.parse()` en la consola para validar)
3. Si hay error CORS: verificar que `app.use(cors())` está en `backend/src/app.js`.
4. Si hay `net::ERR_CONNECTION_REFUSED`: el servidor backend no está corriendo. Ejecutar `node backend/server.js`.
5. Si el método del ApiService no existe: añadirlo en `frontend/js/apiService.js` siguiendo los patrones existentes.

**Fix correcto**: en `frontend/js/apiService.js` o en las rutas del backend. No reemplazar `apiService` por `fetch()` directo.

## Paso 5 — Backend: Capa de Routing

Si la petición llega al servidor pero devuelve 404:

1. Verificar en `backend/src/app.js` que la ruta está registrada: `app.use('/api/<entidad>s', <entidad>Routes)`.
2. Confirmar que el `require()` del módulo de routes es correcto y el archivo existe.
3. Verificar que la ruta está registrada **antes** del middleware de archivos estáticos (antes de `express.static()`).
4. Comprobar el método HTTP: una ruta `router.get()` no responde a `POST`.

**Fix correcto**: en `backend/src/app.js` o en el archivo `<entidad>.routes.js`.

## Paso 6 — Backend: Capa de Controller

Si la petición llega pero el servidor responde con 500 sin mensaje claro:

1. Verificar que todos los métodos del controller tienen `try/catch` y llaman a `next(error)` en el catch.
2. Verificar que el errorHandler middleware está registrado al final de `backend/src/app.js`: `app.use(errorHandler)`.
3. Añadir `console.error(error)` temporal en el catch para ver el stack trace completo.
4. Verificar que el controller solo extrae datos de `req` y delega al service; no debe tener lógica de negocio.

**Fix correcto**: en el controller o en el middleware `errorHandler`. No atrapar errores en el controller para esconderlos.

## Paso 7 — Backend: Capa de Service

Si el error tiene código 400 o 422 (validación):

1. Añadir `console.log('data recibida:', data)` al inicio del método del service.
2. Ejecutar `Entity.fromRequest(data)` manualmente en la consola de Node para ver qué datos produce.
3. Ejecutar `Entity.validate(entityData)` y revisar el array de errores devuelto.
4. Si `fromRequest()` no normaliza correctamente un campo, corregir en la entidad, no en el service.
5. Si la validación es demasiado estricta o incorrecta, corregir `Entity.validate()`.

**Fix correcto**: en `<entidad>.entity.js` (métodos `fromRequest` o `validate`). No saltarse la validación en el service para "que funcione".

## Paso 8 — Backend: Capa de Repository / Persistencia

Si los datos no se guardan o el archivo JSON está corrupto:

1. Verificar que `backend/data/<entidad>s.json` existe. Si no existe, `ensureFile()` no se llamó. Revisar `backend/server.js`.
2. Verificar que el archivo JSON tiene formato de **array plano**: `[{...}, {...}]`. Si está corrupto, restaurar con `[]` vacío.
3. Comprobar que `JsonRepository` recibe la ruta absoluta correcta al archivo. Añadir `console.log(this.filePath)` en el constructor temporalmente.
4. Si `update()` no persiste cambios, verificar que `_writeAll()` recibe el array completo (no solo el elemento modificado).
5. Si hay conflictos de escritura concurrente (raro en desarrollo), verificar que las operaciones son `async/await` correctamente encadenadas.

**Fix correcto**: en `JsonRepository.js` o en el repository específico de la entidad. No escribir al archivo directamente desde el service.

## Paso 9 — Aplicar el fix en la capa correcta

Reglas para el fix:

- **Aplicar el fix en la capa donde está la causa raíz**, no donde se manifiesta el síntoma.
- No añadir `try/catch` silenciosos que oculten el error sin resolverlo.
- No duplicar validaciones en múltiples capas para compensar un bug en una sola.
- No modificar el formato de los archivos JSON de persistencia (array plano de objetos) como workaround.
- Después del fix, verificar que el test manual completo funciona: crear → leer → actualizar → eliminar.
