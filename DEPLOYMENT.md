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
- ✅ **Filtrado por Categorías**: Botones toggle para cada categoría (desayuno, comida, cena, etc.)

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
- Desayuno (☕)
- Comida (☀️)
- Cena (🌙)
- Picoteo (🍪)
- Dulce (🍬)

## Estructura de Archivos

```
windsurf-project/
├── backend/
│   ├── server.js              # Punto de entrada del servidor
│   ├── src/
│   │   ├── app.js             # Configuración Express
│   │   ├── config/            # Configuración centralizada
│   │   ├── recipes/           # Módulo Recetas (entity, repository, service, controller, routes)
│   │   ├── menus/             # Módulo Menús (entity, repository, service, controller, routes)
│   │   └── shared/            # Utilidades compartidas
│   └── data/
│       ├── recipes.json       # Base de datos de recetas
│       └── menus.json         # Base de datos de menús
├── frontend/
│   ├── index.html             # Interfaz principal SPA
│   └── js/
│       ├── app.js             # Punto de entrada y coordinador
│       ├── config.js          # Configuración global
│       ├── apiService.js      # Servicio de API
│       ├── core/
│       │   └── AppState.js    # Estado observable global
│       ├── features/
│       │   └── recipes/
│       │       └── RecipeManager.js  # Gestión de recetas
│       ├── shared/
│       │   ├── BaseManager.js # Clase base para managers
│       │   ├── components/
│       │   │   └── RecipeCard.js     # Componente reutilizable
│       │   └── utils.js       # Utilidades compartidas
│       ├── manualMenuManager.js      # Creación manual de menús
│       ├── menuManager.js            # Gestión de menús
│       ├── tabManager.js             # Navegación por tabs
│       └── uiHelpers.js              # Helpers de UI
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

## Seguridad
- **Solo red local**: No accesible desde internet
- **Sin autenticación**: Confiable para uso familiar
- **Datos locales**: Almacenamiento en JSON local

## Soporte
Para problemas o sugerencias, revisa los logs del servidor o verifica la configuración de red.
