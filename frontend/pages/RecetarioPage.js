/**
 * ============================================
 * RECETARIO PAGE
 * ============================================
 * 
 * Page component for the recipes section
 */

import { appState } from '../../js/core/AppState.js';
import { RecipeManager } from '../../js/features/recipes/RecipeManager.js';

export class RecetarioPage {
  constructor(appState, recipeManager) {
    this.appState = appState;
    this.recipeManager = recipeManager;
  }

  init() {
    console.log('[RecetarioPage] Initializing...');
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    document.getElementById('recipeForm')?.addEventListener('submit', (e) => {
      this.recipeManager.saveRecipe(e);
    });

    document.getElementById('recipeSearch')?.addEventListener('input', () => {
      this.recipeManager.render();
    });
  }

  render() {
    // Initialize category filter buttons
    const categoryFilters = this.appState.get('categoryFilters');
    Object.keys(categoryFilters).forEach(category => {
      const btn = document.getElementById(`filter-${category}`);
      if (btn) {
        btn.classList.toggle('active', categoryFilters[category]);
      }
    });

    this.recipeManager.loadRecipes();
  }
}
