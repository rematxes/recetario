/**
 * ============================================
 * MENUS PAGE
 * ============================================
 * 
 * Page component for the menus section
 */

import { appState } from '../../js/core/AppState.js';
import { RecipeManager } from '../../js/features/recipes/RecipeManager.js';
import { MenuManager } from '../../js/menuManager.js';
import { ManualMenuManager } from '../../js/manualMenuManager.js';

export class MenusPage {
  constructor(appState, recipeManager, menuManager, manualMenuManager) {
    this.appState = appState;
    this.recipeManager = recipeManager;
    this.menuManager = menuManager;
    this.manualMenuManager = manualMenuManager;
  }

  init() {
    console.log('[MenusPage] Initializing...');
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    document.getElementById('recipeSelectorSearch')?.addEventListener('input', () => {
      this.handleSelectorSearch();
    });
  }

  handleSelectorSearch() {
    if (this.appState.get('manualMenuForm').selectedDay !== null) {
      this.manualMenuManager.renderRecipeSelector();
    } else if (this.menuManager.substitutionState.menuId !== null) {
      this.menuManager.renderSubstitutionSelector();
    }
  }

  render() {
    // Initialize selector category filter buttons
    const selectorFilters = this.appState.get('selectorCategoryFilters') || {
      comida: true,
      cena: true,
      general: true,
      picoteo: true,
      dulce: true
    };
    this.appState.set('selectorCategoryFilters', selectorFilters);
    Object.keys(selectorFilters).forEach(category => {
      const btn = document.getElementById(`selector-filter-${category}`);
      if (btn) {
        btn.classList.toggle('active', selectorFilters[category]);
      }
    });

    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);

    const menuDateInput = document.getElementById('menuWeekStart');
    if (menuDateInput) {
      menuDateInput.valueAsDate = nextMonday;
    }

    this.menuManager.loadMenus();
  }
}
