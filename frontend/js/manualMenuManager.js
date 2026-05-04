/**
 * ============================================
 * MANUAL MENU MANAGER CLASS
 * ============================================
 */

import { CONFIG } from './config.js';
import { apiService } from './apiService.js';
import { UIHelpers } from './uiHelpers.js';
import { escapeHtml, formatDate, showSuccess, showError } from './utils.js';

export class ManualMenuManager {
  constructor(appState, recipeManager) {
    this.appState = appState;
    this.recipeManager = recipeManager;
  }

  /**
   * Toggles the manual menu form visibility
   */
  toggleForm() {
    const formEl = document.getElementById('manualMenuForm');
    const btn = document.getElementById('toggleManualMenuBtn');

    const formState = this.appState.get('manualMenuForm');
    formState.isExpanded = !formState.isExpanded;
    this.appState.set('manualMenuForm', formState);

    if (formState.isExpanded) {
      formEl.classList.remove('hidden');
      btn.innerHTML = '<i class="fas fa-chevron-up mr-2"></i>Ocultar Formulario';
      btn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
      btn.classList.add('bg-red-500', 'hover:bg-red-600');
      this.initGrid();
    } else {
      formEl.classList.add('hidden');
      btn.innerHTML = '<i class="fas fa-calendar-plus mr-2"></i>Rellenar Manualmente';
      btn.classList.remove('bg-red-500', 'hover:bg-red-600');
      btn.classList.add('bg-blue-500', 'hover:bg-blue-600');
    }
  }

  /**
   * Initializes the manual menu grid
   */
  initGrid() {
    const grid = document.getElementById('manualMenuGrid');
    const startDate = document.getElementById('manualMenuWeekStart')?.value;

    if (!startDate) {
      grid.innerHTML = '<p class="text-gray-500 text-center">Selecciona una fecha de inicio</p>';
      return;
    }

    const baseDate = new Date(startDate);

    grid.innerHTML = CONFIG.DAYS_OF_WEEK.map((dayName, index) => {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + index);

      const dayData = this.appState.get('manualMenuForm').data[index] || {};

      return `
        <div class="bg-gray-50 p-3 rounded-lg border">
          <h5 class="font-semibold mb-2">${dayName} - ${formatDate(currentDate)}</h5>
          
          <div class="space-y-2">
            <div class="bg-red-50 p-2 rounded border-l-4 border-red-400">
              <div class="flex items-center mb-1">
                <i class="fas fa-sun text-red-600 mr-2"></i>
                <span class="font-medium text-sm">Comida</span>
              </div>
              <div class="text-sm mb-2 ${dayData.comida ? 'font-medium' : 'text-gray-500'}">
                ${dayData.comida?.recipeName || 'No seleccionada'}
              </div>
              <button onclick="window.manualMenuManager.openRecipeSelector(${index}, 'comida')" 
                class="w-full px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 font-medium">
                ${dayData.comida ? 'Cambiar' : 'Seleccionar'}
              </button>
            </div>
            
            <div class="bg-indigo-50 p-2 rounded border-l-4 border-indigo-400">
              <div class="flex items-center mb-1">
                <i class="fas fa-moon text-indigo-600 mr-2"></i>
                <span class="font-medium text-sm">Cena</span>
              </div>
              <div class="text-sm mb-2 ${dayData.cena ? 'font-medium' : 'text-gray-500'}">
                ${dayData.cena?.recipeName || 'No seleccionada'}
              </div>
              <button onclick="window.manualMenuManager.openRecipeSelector(${index}, 'cena')" 
                class="w-full px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600 font-medium">
                ${dayData.cena ? 'Cambiar' : 'Seleccionar'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Opens the recipe selector modal
   */
  openRecipeSelector(dayIndex, mealType) {
    const form = this.appState.get('manualMenuForm');
    form.selectedDay = dayIndex;
    form.selectedMeal = mealType;
    form.selectorViewMode = CONFIG.VIEWS.GRID;
    this.appState.set('manualMenuForm', form);

    document.getElementById('recipeSelectorSearch').value = '';

    // Set default category filters based on meal type
    const defaultFilters = mealType === 'comida'
      ? { comida: true, cena: false, general: true, picoteo: false, dulce: false }
      : { comida: false, cena: true, general: true, picoteo: false, dulce: false };

    this.appState.set('selectorCategoryFilters', defaultFilters);

    // Update UI buttons to reflect the filters
    Object.keys(defaultFilters).forEach(category => {
      const btn = document.getElementById(`selector-filter-${category}`);
      if (btn) {
        btn.classList.toggle('active', defaultFilters[category]);
      }
    });

    this.renderRecipeSelector();
    document.getElementById('recipeSelectorModal').classList.remove('hidden');
  }

  /**
   * Closes the recipe selector modal
   */
  closeRecipeSelector() {
    document.getElementById('recipeSelectorModal').classList.add('hidden');
    const form = this.appState.get('manualMenuForm');
    form.selectedDay = null;
    form.selectedMeal = null;
    this.appState.set('manualMenuForm', form);
  }

  /**
   * Renders recipes in the selector modal
   */
  renderRecipeSelector() {
    const container = document.getElementById('recipeSelectorResults');
    const searchTerm = document.getElementById('recipeSelectorSearch').value.toLowerCase().trim();

    const selectorFilters = this.appState.get('selectorCategoryFilters') || {
      comida: true,
      cena: true,
      general: true,
      picoteo: true,
      dulce: true
    };

    let recipes = this.appState.get('recipes').filter(recipe => {
      // Check category filters (like main recipe search)
      const category = recipe.category || 'general';
      return selectorFilters[category];
    });

    if (searchTerm) {
      recipes = this.recipeManager.filterRecipes(recipes, searchTerm);
    }

    // Apply sorting
    recipes = this.recipeManager.sortRecipes(recipes, this.appState.get('selectorSortOrder'));

    if (recipes.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">No hay recetas disponibles con los filtros seleccionados</p>';
      return;
    }

    const isGrid = this.appState.get('manualMenuForm').selectorViewMode === CONFIG.VIEWS.GRID;

    if (isGrid) {
      this.renderSelectorGrid(container, recipes);
    } else {
      this.renderSelectorList(container, recipes);
    }
  }

  /**
   * Renders selector in grid view
   */
  renderSelectorGrid(container, recipes) {
    container.innerHTML = recipes.map(recipe => `
      <div class="card border rounded-lg p-4 hover:shadow-md cursor-pointer bg-white" 
           onclick="window.manualMenuManager.selectRecipe('${recipe.id}')">
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-bold text-sm">${escapeHtml(recipe.name)}</h4>
          ${UIHelpers.getCategoryBadge(recipe.category)}
        </div>
        <div class="text-xs text-gray-500">
          <i class="fas fa-hourglass-half text-green-500 mr-1"></i>
          ${(recipe.prepTime || 0) + (recipe.cookTime || 0)}min total
        </div>
      </div>
    `).join('');
  }

  /**
   * Renders selector in list view
   */
  renderSelectorList(container, recipes) {
    container.innerHTML = recipes.map(recipe => `
      <div class="border rounded-lg p-3 hover:shadow-md cursor-pointer bg-white flex justify-between items-center"
           onclick="window.manualMenuManager.selectRecipe('${recipe.id}')">
        <div>
          <h4 class="font-bold text-sm">${escapeHtml(recipe.name)}</h4>
          <div class="flex gap-2 text-xs text-gray-500 mt-1">
            ${UIHelpers.getCategoryBadge(recipe.category)}
            <span><i class="fas fa-hourglass-half text-green-500 mr-1"></i>${(recipe.prepTime || 0) + (recipe.cookTime || 0)}min</span>
          </div>
        </div>
        <div class="text-blue-600 text-sm font-medium">
          <i class="fas fa-check-circle mr-1"></i>Seleccionar
        </div>
      </div>
    `).join('');
  }

  /**
   * Selects a recipe for the manual menu
   */
  selectRecipe(recipeId) {
    const recipe = this.appState.get('recipes').find(r => r.id === recipeId);
    if (!recipe) return;

    const form = this.appState.get('manualMenuForm');
    const { selectedDay, selectedMeal } = form;

    if (selectedDay === null || !selectedMeal) return;

    if (!form.data[selectedDay]) {
      form.data[selectedDay] = {};
    }

    form.data[selectedDay][selectedMeal] = {
      recipeId: recipe.id,
      recipeName: recipe.name,
      prepTime: recipe.prepTime || 0,
      cookTime: recipe.cookTime || 0,
      totalTime: (recipe.prepTime || 0) + (recipe.cookTime || 0)
    };

    this.appState.set('manualMenuForm', form);
    this.closeRecipeSelector();
    this.initGrid();
  }

  /**
   * Toggles selector view mode
   */
  toggleSelectorView(mode) {
    const form = this.appState.get('manualMenuForm');
    form.selectorViewMode = mode;
    this.appState.set('manualMenuForm', form);
    this.renderRecipeSelector();

    const gridBtn = document.getElementById('selectorGridViewBtn');
    const listBtn = document.getElementById('selectorListViewBtn');

    if (gridBtn) {
      gridBtn.classList.toggle('active', mode === 'grid');
      gridBtn.classList.toggle('bg-blue-600', mode === 'grid');
    }
    if (listBtn) {
      listBtn.classList.toggle('active', mode === 'list');
      listBtn.classList.toggle('bg-blue-600', mode === 'list');
    }
  }

  /**
   * Saves the manual menu
   */
  async save() {
    const startDate = document.getElementById('manualMenuWeekStart')?.value;

    if (!startDate) {
      showError('Selecciona una fecha de inicio');
      return;
    }

    const baseDate = new Date(startDate);
    const menuDays = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + i);

      const dayData = this.appState.get('manualMenuForm').data[i] || {};

      menuDays.push({
        date: currentDate.toISOString(),
        dayName: CONFIG.DAYS_OF_WEEK[i],
        meals: {
          ...(dayData.comida && {
            comida: {
              recipeId: dayData.comida.recipeId,
              recipeName: dayData.comida.recipeName,
              prepTime: dayData.comida.prepTime,
              cookTime: dayData.comida.cookTime,
              totalTime: dayData.comida.totalTime
            }
          }),
          ...(dayData.cena && {
            cena: {
              recipeId: dayData.cena.recipeId,
              recipeName: dayData.cena.recipeName,
              prepTime: dayData.cena.prepTime,
              cookTime: dayData.cena.cookTime,
              totalTime: dayData.cena.totalTime
            }
          })
        }
      });
    }

    try {
      await apiService.createMenu({
        weekStart: baseDate.toISOString(),
        days: menuDays
      });

      showSuccess('Menú guardado correctamente');
      this.clear();
      window.menuManager.loadMenus();
    } catch (error) {
      showError('Error al guardar el menú');
      console.error('Save manual menu error:', error);
    }
  }

  /**
   * Clears the manual menu form
   */
  clear() {
    const form = this.appState.get('manualMenuForm');
    form.data = {};
    this.appState.set('manualMenuForm', form);
    const startDateInput = document.getElementById('manualMenuWeekStart');
    if (startDateInput) startDateInput.value = '';
    this.initGrid();
  }
}
