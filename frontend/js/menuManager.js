/**
 * ============================================
 * MENU MANAGER CLASS
 * ============================================
 */

import { apiService } from './apiService.js';
import { UIHelpers } from './uiHelpers.js';
import { escapeHtml, formatDate, showSuccess, showError } from './utils.js';

export class MenuManager {
  constructor(appState, recipeManager) {
    this.appState = appState;
    this.recipeManager = recipeManager;
    this.substitutionState = {
      menuId: null,
      dayIndex: null,
      mealType: null,
      viewMode: 'grid'
    };
  }

  /**
   * Loads all menus from the API
   */
  async loadMenus() {
    try {
      const menus = await apiService.getAllMenus();
      this.appState.set('menus', menus);
      this.renderMenus();
    } catch (error) {
      showError('Error al cargar menús');
      console.error('Load menus error:', error);
    }
  }

  /**
   * Renders all menus in the container
   */
  renderMenus() {
    const container = document.getElementById('menusList');

    if (this.appState.get('menus').length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-gray-500">
          <i class="fas fa-calendar-alt text-4xl mb-4"></i>
          <p>No hay menús generados</p>
          <p class="text-sm mt-2">Genera tu primer menú semanal</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.appState.get('menus').map((menu, index) => this.renderMenuCard(menu, index)).join('');
  }

  /**
   * Renders a single menu card
   * @param {Object} menu - Menu object
   * @param {number} index - Menu index
   * @returns {string} HTML string
   */
  renderMenuCard(menu, index) {
    const weekStart = new Date(menu.weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const menuName = menu.name || `Menú ${index + 1}`;
    const populatedDays = menu.days.filter(d => d.meals?.comida || d.meals?.cena).length;
    const isExpanded = this.appState.get('expandedMenus').has(menu.id);

    return `
      <div class="border rounded-lg overflow-hidden">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all" 
             onclick="window.menuManager.toggleMenu('${menu.id}')">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <i class="fas fa-chevron-down transition-transform ${isExpanded ? 'rotate-180' : ''}" id="menu-chevron-${menu.id}"></i>
              <div>
                <h3 class="font-bold text-lg">${escapeHtml(menuName)}</h3>
                <p class="text-sm text-blue-100">
                  ${formatDate(weekStart)} - ${formatDate(weekEnd)} • ${populatedDays} días con recetas
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="event.stopPropagation(); window.menuManager.editName('${menu.id}', '${escapeHtml(menuName)}')" 
                class="px-3 py-1 bg-white text-blue-600 rounded text-sm hover:bg-blue-50 font-medium">
                <i class="fas fa-edit mr-1"></i>Editar
              </button>
              <button onclick="event.stopPropagation(); window.menuManager.deleteMenu('${menu.id}')" 
                class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 font-medium">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div id="menu-content-${menu.id}" class="${isExpanded ? '' : 'hidden'}">
          <div class="p-4 space-y-3">
            ${menu.days.map((day, dayIndex) => this.renderDayCard(day, menu.id, dayIndex)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders a single day card within a menu
   */
  renderDayCard(day, menuId, dayIndex) {
    return `
      <div class="bg-gray-50 rounded-lg p-4 border border-gray-200" data-day-index="${dayIndex}" data-menu-id="${menuId}">
        <div class="font-bold text-lg text-blue-700 mb-3 pb-2 border-b border-gray-200">
          <i class="fas fa-calendar-day mr-2"></i>${day.dayName} - ${formatDate(day.date)}
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${this.renderMealCard(day.meals?.comida, 'comida', menuId, dayIndex)}
          ${this.renderMealCard(day.meals?.cena, 'cena', menuId, dayIndex)}
        </div>
      </div>
    `;
  }

  /**
   * Renders a meal card (comida or cena)
   */
  renderMealCard(meal, type, menuId, dayIndex) {
    const config = {
      comida: { label: 'Comida', color: 'red', icon: 'fa-sun' },
      cena: { label: 'Cena', color: 'indigo', icon: 'fa-moon' }
    }[type];

    const hasRecipe = meal?.recipeId;
    const clickHandler = hasRecipe ? `onclick="window.recipeManager.viewRecipe('${meal.recipeId}')"` : '';
    const cursorClass = hasRecipe ? 'cursor-pointer hover:bg-gray-100' : '';

    return `
      <div class="bg-white rounded-lg p-3 border-2 border-${config.color}-400 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-${config.color}-700">
            <i class="fas ${config.icon} mr-2"></i>${config.label}
          </span>
          ${hasRecipe ? `
            <div class="flex gap-1 text-xs">
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                <i class="fas fa-clock mr-1"></i>${meal.prepTime || 0}min
              </span>
              <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">
                <i class="fas fa-fire mr-1"></i>${meal.cookTime || 0}min
              </span>
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                <i class="fas fa-hourglass-half mr-1"></i>${meal.totalTime || 0}min
              </span>
            </div>
          ` : ''}
        </div>
        
        <div class="flex justify-between items-center mb-3">
          <div class="font-medium text-gray-900 p-2 bg-gray-50 rounded border border-gray-200 ${cursorClass} flex-1" ${clickHandler}>
            ${hasRecipe ? escapeHtml(meal.recipeName) : 'No asignado'}
          </div>
          
          <button onclick="window.menuManager.substituteRecipe('${menuId}', ${dayIndex}, '${type}')" 
            class="w-10 h-10 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 font-medium flex items-center justify-center ml-2 flex-shrink-0">
            <i class="fas fa-exchange-alt"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Toggles menu expansion
   */
  toggleMenu(menuId) {
    const content = document.getElementById(`menu-content-${menuId}`);
    const chevron = document.getElementById(`menu-chevron-${menuId}`);

    const expandedMenus = this.appState.get('expandedMenus');
    if (expandedMenus.has(menuId)) {
      expandedMenus.delete(menuId);
      this.appState.set('expandedMenus', expandedMenus);
      content.classList.add('hidden');
      chevron.style.transform = 'rotate(0deg)';
    } else {
      expandedMenus.add(menuId);
      this.appState.set('expandedMenus', expandedMenus);
      content.classList.remove('hidden');
      chevron.style.transform = 'rotate(180deg)';
    }
  }

  /**
   * Generates a weekly menu automatically
   */
  async generateMenu() {
    const weekStart = document.getElementById('menuWeekStart').value;

    if (!weekStart) {
      showError('Selecciona una fecha de inicio');
      return;
    }

    try {
      await apiService.generateMenu(weekStart);
      showSuccess('Menú generado correctamente');
      await this.loadMenus();
    } catch (error) {
      showError('Error al generar el menú');
      console.error('Generate menu error:', error);
    }
  }

  /**
   * Opens recipe selector for substitution
   */
  openSubstitutionSelector(menuId, dayIndex, mealType) {
    console.log('[MenuManager] openSubstitutionSelector called', menuId, dayIndex, mealType);
    this.substitutionState = { menuId, dayIndex, mealType, viewMode: 'grid' };
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

    this.renderSubstitutionSelector();
    
    const modal = document.getElementById('recipeSelectorModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.remove('hidden');
      document.body.classList.add('modal-open');
    } else {
      console.error('[MenuManager] recipeSelectorModal not found');
    }
    
    const expandedMenus = this.appState.get('expandedMenus');
    expandedMenus.add(menuId);
    this.appState.set('expandedMenus', expandedMenus);
  }

  /**
   * Renders recipes in the substitution selector
   */
  renderSubstitutionSelector() {
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
      recipes = recipes.filter(recipe => {
        const matchesName = recipe.name?.toLowerCase().includes(searchTerm);
        const matchesCategory = recipe.category?.toLowerCase().includes(searchTerm);
        const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
        const matchesTime = !isNaN(parseInt(searchTerm)) && totalTime <= parseInt(searchTerm);
        return matchesName || matchesCategory || matchesTime;
      });
    }

    // Apply sorting
    recipes = this.recipeManager.sortRecipes(recipes, this.appState.get('selectorSortOrder'));

    if (recipes.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">No hay recetas disponibles con los filtros seleccionados</p>';
      return;
    }

    const isGrid = this.substitutionState.viewMode === 'grid';

    if (isGrid) {
      container.innerHTML = recipes.map(recipe => `
        <div class="card bg-white border-2 border-gray-300 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer" 
             onclick="window.menuManager.selectSubstitutionRecipe('${recipe.id}')">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-bold text-lg text-gray-900">${escapeHtml(recipe.name)}</h4>
            ${UIHelpers.getCategoryBadge(recipe.category)}
          </div>
          <div class="flex flex-wrap gap-2 text-xs bg-white p-2 rounded border border-gray-200">
            ${UIHelpers.getTimeBadges(recipe)}
          </div>
          <div class="mt-3 text-center">
            <span class="text-blue-600 font-medium text-sm">
              <i class="fas fa-check-circle mr-1"></i>Click para seleccionar
            </span>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = recipes.map(recipe => `
        <div class="bg-white border-2 border-gray-300 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer flex justify-between items-center"
             onclick="window.menuManager.selectSubstitutionRecipe('${recipe.id}')">
          <div class="flex-1">
            <h4 class="font-bold text-lg text-gray-900">${escapeHtml(recipe.name)}</h4>
            <div class="flex flex-wrap gap-2 text-xs mt-1">
              ${UIHelpers.getCategoryBadge(recipe.category)}
              ${UIHelpers.getTimeBadges(recipe)}
            </div>
          </div>
          <div class="text-blue-600 font-medium ml-4">
            <i class="fas fa-check-circle mr-1"></i>Seleccionar
          </div>
        </div>
      `).join('');
    }
  }

  /**
   * Handles recipe selection for substitution
   */
  async selectSubstitutionRecipe(recipeId) {
    const recipe = this.appState.get('recipes').find(r => r.id === recipeId);
    if (!recipe) return;

    const { menuId, dayIndex, mealType } = this.substitutionState;
    const menus = this.appState.get('menus');
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;

    const updatedDays = [...menu.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      meals: {
        ...updatedDays[dayIndex].meals,
        [mealType]: {
          recipeId: recipe.id,
          recipeName: recipe.name,
          prepTime: recipe.prepTime || 0,
          cookTime: recipe.cookTime || 0,
          totalTime: (recipe.prepTime || 0) + (recipe.cookTime || 0)
        }
      }
    };

    try {
      await apiService.updateMenu(menuId, { days: updatedDays });
      const modal = document.getElementById('recipeSelectorModal');
      if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      }
      document.body.classList.remove('modal-open');
      const expandedMenus = this.appState.get('expandedMenus');
      expandedMenus.add(menuId);
      this.appState.set('expandedMenus', expandedMenus);
      await this.loadMenus();

      setTimeout(() => {
        const dayElement = document.querySelector(`[data-day-index="${dayIndex}"][data-menu-id="${menuId}"]`);
        if (dayElement) {
          dayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          dayElement.classList.add('ring-2', 'ring-blue-400');
          setTimeout(() => dayElement.classList.remove('ring-2', 'ring-blue-400'), 2000);
        }
      }, 100);

      showSuccess(`Receta cambiada a "${recipe.name}"`);
    } catch (error) {
      showError('Error al cambiar la receta');
      console.error('Substitute recipe error:', error);
    }
  }

  /**
   * Toggles substitution selector view mode
   */
  toggleSubstitutionView(mode) {
    this.substitutionState.viewMode = mode;
    this.renderSubstitutionSelector();

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
   * Substitutes a recipe in a menu
   */
  substituteRecipe(menuId, dayIndex, mealType) {
    this.openSubstitutionSelector(menuId, dayIndex, mealType);
  }

  /**
   * Edits a menu name
   */
  async editName(menuId, currentName) {
    const newName = prompt('Editar nombre del menú:', currentName);
    if (newName === null || newName.trim() === '') return;

    const menus = this.appState.get('menus');
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;

    try {
      await apiService.updateMenu(menuId, {
        name: newName.trim(),
        days: menu.days
      });
      showSuccess('Nombre actualizado correctamente');
      await this.loadMenus();
    } catch (error) {
      showError('Error al actualizar el nombre');
      console.error('Edit name error:', error);
    }
  }

  /**
   * Deletes a menu
   */
  async deleteMenu(menuId) {
    const menus = this.appState.get('menus');
    const menuIndex = menus.findIndex(m => m.id === menuId);
    if (menuIndex === -1) return;

    const menu = menus[menuIndex];
    const menuName = menu?.name || 'este menú';

    if (!confirm(`¿Eliminar "${menuName}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await apiService.deleteMenu(menuId);
      const expandedMenus = this.appState.get('expandedMenus');
      expandedMenus.delete(menuId);
      this.appState.set('expandedMenus', expandedMenus);
      showSuccess('Menú eliminado correctamente');

      // Determine which menu to focus after deletion (next or previous)
      const nextMenuId = menus[menuIndex + 1]?.id ||
                         menus[menuIndex - 1]?.id ||
                         null;

      await this.loadMenus();

      // Expand and focus on the nearest menu after reload
      if (nextMenuId) {
        this.toggleMenu(nextMenuId);
        setTimeout(() => {
          const menuElement = document.querySelector(`[id="menu-content-${nextMenuId}"]`)?.parentElement;
          if (menuElement) {
            menuElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            menuElement.classList.add('ring-2', 'ring-blue-400');
            setTimeout(() => menuElement.classList.remove('ring-2', 'ring-blue-400'), 2000);
          }
        }, 100);
      }
    } catch (error) {
      showError('Error al eliminar el menú');
      console.error('Delete menu error:', error);
    }
  }
}
