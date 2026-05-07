/**
 * Observable Application State
 * Centralizes state management with subscription pattern
 */
export class AppState {
  constructor() {
    this._state = {
      recipes: [],
      menus: [],
      currentView: 'grid',
      recipeSortOrder: 'date-desc',
      selectorSortOrder: 'date-desc',
      categoryFilters: {
        comida: true,
        cena: true,
        general: true,
        picoteo: true,
        dulce: true
      },
      expandedMenus: new Set(),
      manualMenuForm: {
        isExpanded: false,
        selectedDay: null,
        selectedMeal: null,
        selectorViewMode: 'grid',
        data: {}
      },
      editingRecipeId: null,
      isAuthenticated: false,
      authUsername: null
    };
    this._listeners = new Map();
  }

  get(key) {
    return this._state[key];
  }

  set(key, value) {
    this._state[key] = value;
    this._notify(key, value);
  }

  update(key, updates) {
    if (typeof this._state[key] === 'object' && this._state[key] !== null) {
      this._state[key] = { ...this._state[key], ...updates };
    } else {
      this._state[key] = updates;
    }
    this._notify(key, this._state[key]);
  }

  subscribe(key, callback) {
    if (!this._listeners.has(key)) {
      this._listeners.set(key, new Set());
    }
    this._listeners.get(key).add(callback);
    
    return () => this._listeners.get(key)?.delete(callback);
  }

  _notify(key, value) {
    this._listeners.get(key)?.forEach(cb => cb(value));
  }
}

export const appState = new AppState();
