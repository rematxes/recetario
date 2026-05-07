/**
 * ============================================
 * CONFIGURATION & CONSTANTS
 * ============================================
 */

// Detectar la URL base automáticamente
const getApiBase = () => {
  const { protocol, hostname, port } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  return `${protocol}//${hostname}:3000`;
};

export const CONFIG = {
  API_BASE: getApiBase(),
  DEFAULT_CATEGORY: 'general',
  DAYS_OF_WEEK: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  MEAL_TYPES: ['comida', 'cena'],
  VIEWS: {
    GRID: 'grid',
    LIST: 'list'
  }
};

export const CATEGORY_CONFIG = {
  general: { label: 'General', color: 'gradient', icons: ['fa-sun', 'fa-moon'], gradient: 'from-red-500 to-indigo-500' },
  comida: { label: 'Comida', color: 'red', icon: 'fa-sun' },
  cena: { label: 'Cena', color: 'indigo', icon: 'fa-moon' },
  picoteo: { label: 'Picoteo', color: 'green', icon: 'fa-cookie' },
  dulce: { label: 'Dulce', color: 'pink', icon: 'fa-candy-cane' }
};

export const TIME_ICONS = {
  prep: { icon: 'fa-clock', color: 'blue', label: 'Prep' },
  cook: { icon: 'fa-fire', color: 'orange', label: 'Cocción' },
  total: { icon: 'fa-hourglass-half', color: 'green', label: 'Total' }
};
