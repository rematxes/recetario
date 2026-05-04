/**
 * ============================================
 * RECIPE MANAGER CLASS
 * ============================================
 */

import { CONFIG } from './config.js';
import { apiService } from './apiService.js';
import { UIHelpers } from './uiHelpers.js';
import { escapeHtml, showSuccess, showError } from './utils.js';

export class RecipeManager {
  constructor(appState) {
    this.appState = appState;
  }

  /**
   * Loads all recipes from the API
   */
  async loadRecipes() {
    try {
      this.appState.recipes = await apiService.getAllRecipes();
      this.renderRecipes();
    } catch (error) {
      showError('Error al cargar recetas');
      console.error('Load recipes error:', error);
    }
  }

  /**
   * Renders recipes in the current view (grid or list)
   */
  renderRecipes() {
    const container = document.getElementById('recipesList');
    const searchTerm = document.getElementById('recipeSearch')?.value?.toLowerCase().trim() || '';

    let filteredRecipes = this.filterRecipes(this.appState.recipes, searchTerm);
    filteredRecipes = this.sortRecipes(filteredRecipes, this.appState.recipeSortOrder);

    if (filteredRecipes.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-gray-500">
          <i class="fas fa-search text-4xl mb-4"></i>
          <p>${searchTerm ? 'No se encontraron recetas' : 'No hay recetas disponibles'}</p>
          ${searchTerm ? '<button onclick="document.getElementById(\'recipeSearch\').value=\'\';window.recipeManager.renderRecipes()" class="mt-4 text-blue-600 underline">Limpiar búsqueda</button>' : ''}
        </div>
      `;
      return;
    }

    if (this.appState.currentView === CONFIG.VIEWS.GRID) {
      this.renderGridView(container, filteredRecipes);
    } else {
      this.renderListView(container, filteredRecipes);
    }
  }

  /**
   * Sorts recipes based on the specified order
   * @param {Array} recipes - Array of recipe objects
   * @param {string} sortOrder - Sort order: name-asc, name-desc, date-asc, date-desc
   * @returns {Array} Sorted recipes
   */
  sortRecipes(recipes, sortOrder) {
    const sorted = [...recipes];

    switch (sortOrder) {
      case 'name-asc':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }));
      case 'name-desc':
        return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'es', { sensitivity: 'base' }));
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
      default:
        return sorted;
    }
  }

  /**
   * Filters recipes based on search term and category filters
   * @param {Array} recipes - Array of recipe objects
   * @param {string} searchTerm - Search term
   * @returns {Array} Filtered recipes
   */
  filterRecipes(recipes, searchTerm) {
    // First filter by category filters
    let filtered = recipes.filter(recipe => {
      const category = recipe.category || 'general';
      const filters = this.appState.categoryFilters;

      // Recipe shows if its category is active OR if it's "general" and comida/cena are active
      if (filters[category] !== false) {
        return true;
      }

      // General recipes also appear when Comida or Cena filters are active
      if (category === 'general' && (filters['comida'] !== false || filters['cena'] !== false)) {
        return true;
      }

      return false;
    });

    // Then filter by search term if provided
    if (!searchTerm) return filtered;

    const isTimeFilter = !isNaN(parseInt(searchTerm));

    return filtered.filter(recipe => {
      const matchesName = recipe.name?.toLowerCase().includes(searchTerm);
      const matchesDescription = recipe.description?.toLowerCase().includes(searchTerm);
      const matchesCategory = recipe.category?.toLowerCase().includes(searchTerm);

      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      const matchesTime = isTimeFilter && totalTime <= parseInt(searchTerm);

      return matchesName || matchesDescription || matchesCategory || matchesTime;
    });
  }

  /**
   * Renders recipes in grid view
   * @param {HTMLElement} container - Container element
   * @param {Array} recipes - Array of recipe objects
   */
  renderGridView(container, recipes) {
    container.innerHTML = recipes.map(recipe => `
      <div class="card bg-white border-2 border-gray-300 rounded-lg p-5 hover:shadow-lg hover:border-blue-400 transition-all" data-recipe-id="${recipe.id}">
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-bold text-lg text-gray-900">${escapeHtml(recipe.name)}</h3>
          ${UIHelpers.getCategoryBadge(recipe.category)}
        </div>
        
        <p class="text-gray-700 text-sm mb-3 bg-gray-50 p-3 rounded">
          ${escapeHtml(recipe.description || 'Sin descripción')}
        </p>
        
        <div class="flex flex-wrap gap-2 mb-4 p-2 bg-white rounded border border-gray-200">
          ${UIHelpers.getTimeBadges(recipe)}
        </div>
        
        <div class="flex gap-2 pt-3 border-t border-gray-200">
          <button onclick="window.recipeManager.viewRecipe('${recipe.id}')" 
            class="flex-1 px-3 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
            <i class="fas fa-eye mr-1"></i>Ver
          </button>
          <button onclick="window.recipeManager.editRecipe('${recipe.id}')" 
            class="flex-1 px-3 py-2 bg-yellow-600 text-white rounded font-medium hover:bg-yellow-700 transition-colors">
            <i class="fas fa-edit mr-1"></i>Editar
          </button>
          <button onclick="window.recipeManager.deleteRecipe('${recipe.id}')" 
            class="px-3 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Renders recipes in list view
   * @param {HTMLElement} container - Container element
   * @param {Array} recipes - Array of recipe objects
   */
  renderListView(container, recipes) {
    container.innerHTML = recipes.map(recipe => `
      <div class="bg-white border-2 border-gray-300 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 transition-all" data-recipe-id="${recipe.id}">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <div class="flex-1">
            <h3 class="font-bold text-lg text-gray-900 mb-1">${escapeHtml(recipe.name)}</h3>
            <p class="text-gray-700 text-sm bg-gray-50 p-2 rounded mb-2">
              ${escapeHtml(recipe.description || 'Sin descripción')}
            </p>
            <div class="flex flex-wrap gap-2 p-2 bg-white rounded border border-gray-200">
              ${UIHelpers.getCategoryBadge(recipe.category)}
              ${UIHelpers.getTimeBadges(recipe)}
            </div>
          </div>
          
          <div class="flex gap-2 md:flex-col lg:flex-row">
            <button onclick="window.recipeManager.viewRecipe('${recipe.id}')" 
              class="px-3 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
              <i class="fas fa-eye"></i>
            </button>
            <button onclick="window.recipeManager.editRecipe('${recipe.id}')" 
              class="px-3 py-2 bg-yellow-600 text-white rounded font-medium hover:bg-yellow-700 transition-colors">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="window.recipeManager.deleteRecipe('${recipe.id}')" 
              class="px-3 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Opens modal to view recipe details
   * @param {string} id - Recipe ID
   */
  viewRecipe(id) {
    const recipe = this.appState.recipes.find(r => r.id === id);
    if (!recipe) return;

    const modalContent = `
      <div class="space-y-5">
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 class="font-semibold text-gray-900 text-lg mb-2">
            <i class="fas fa-info-circle mr-2 text-blue-500"></i>Descripción
          </h4>
          <p class="text-gray-800">${escapeHtml(recipe.description || 'Sin descripción')}</p>
        </div>
        
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 class="font-semibold text-gray-900 text-lg mb-3">
            <i class="fas fa-clock mr-2 text-blue-600"></i>Información
          </h4>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="bg-white p-3 rounded border border-gray-200">
              <strong>Categoría:</strong> ${UIHelpers.getCategoryBadge(recipe.category)}
            </div>
            <div class="bg-white p-3 rounded border border-gray-200">
              <strong><i class="fas fa-clock text-blue-600 mr-1"></i>Prep:</strong> ${recipe.prepTime || 0} min
            </div>
            <div class="bg-white p-3 rounded border border-gray-200">
              <strong><i class="fas fa-fire text-orange-600 mr-1"></i>Cocción:</strong> ${recipe.cookTime || 0} min
            </div>
            <div class="bg-white p-3 rounded border border-gray-200">
              <strong><i class="fas fa-hourglass-half text-green-600 mr-1"></i>Total:</strong> ${(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
            </div>
          </div>
        </div>
        
        <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h4 class="font-semibold text-gray-900 text-lg mb-3">
            <i class="fas fa-shopping-basket mr-2 text-orange-500"></i>Ingredientes
          </h4>
          <ul class="list-disc list-inside text-gray-800 space-y-1 bg-white p-3 rounded border border-gray-200">
            ${recipe.ingredients?.split('\n').filter(i => i.trim()).map(ing => 
              `<li class="py-1">${escapeHtml(ing.trim())}</li>`
            ).join('') || '<li class="text-gray-500">Sin ingredientes</li>'}
          </ul>
        </div>
        
        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 class="font-semibold text-gray-900 text-lg mb-3">
            <i class="fas fa-list-ol mr-2 text-green-500"></i>Instrucciones
          </h4>
          <div class="text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">
            ${escapeHtml(recipe.instructions) || 'Sin instrucciones'}
          </div>
        </div>
      </div>
    `;

    document.getElementById('modalRecipeName').textContent = recipe.name;
    document.getElementById('modalRecipeContent').innerHTML = modalContent;
    document.getElementById('recipeModal').classList.remove('hidden');
  }

  /**
   * Opens modal to edit a recipe
   * @param {string} id - Recipe ID
   */
  editRecipe(id) {
    const recipe = this.appState.recipes.find(r => r.id === id);
    if (!recipe) return;

    this.appState.editingRecipeId = id;

    document.getElementById('editRecipeId').value = recipe.id;
    document.getElementById('editRecipeName').value = recipe.name;
    document.getElementById('editRecipeCategory').value = recipe.category;
    document.getElementById('editRecipeDescription').value = recipe.description || '';
    document.getElementById('editRecipePrepTime').value = recipe.prepTime || 0;
    document.getElementById('editRecipeCookTime').value = recipe.cookTime || 0;
    document.getElementById('editRecipeIngredients').value = recipe.ingredients || '';
    document.getElementById('editRecipeInstructions').value = recipe.instructions || '';

    document.getElementById('editRecipeModal').classList.remove('hidden');
  }

  /**
   * Saves a recipe (create or update)
   * @param {Event} event - Form submit event
   */
  async saveRecipe(event) {
    event.preventDefault();

    const isEditing = !!this.appState.editingRecipeId;

    const recipeData = {
      name: document.getElementById(isEditing ? 'editRecipeName' : 'recipeName').value.trim(),
      category: document.getElementById(isEditing ? 'editRecipeCategory' : 'recipeCategory').value,
      description: document.getElementById(isEditing ? 'editRecipeDescription' : 'recipeDescription').value.trim(),
      prepTime: parseInt(document.getElementById(isEditing ? 'editRecipePrepTime' : 'recipePrepTime').value) || 0,
      cookTime: parseInt(document.getElementById(isEditing ? 'editRecipeCookTime' : 'recipeCookTime').value) || 0,
      ingredients: document.getElementById(isEditing ? 'editRecipeIngredients' : 'recipeIngredients').value.trim(),
      instructions: document.getElementById(isEditing ? 'editRecipeInstructions' : 'recipeInstructions').value.trim()
    };

    try {
      if (isEditing) {
        await apiService.updateRecipe(this.appState.editingRecipeId, recipeData);
        showSuccess('Receta actualizada correctamente');
        this.closeEditModal();
      } else {
        await apiService.createRecipe(recipeData);
        showSuccess('Receta creada correctamente');
        this.resetForm('recipeForm');
      }

      await this.loadRecipes();
    } catch (error) {
      showError('Error al guardar la receta');
      console.error('Save recipe error:', error);
    }
  }

  /**
   * Deletes a recipe
   * @param {string} id - Recipe ID
   */
  async deleteRecipe(id) {
    const recipeIndex = this.appState.recipes.findIndex(r => r.id === id);
    if (recipeIndex === -1) return;

    const recipe = this.appState.recipes[recipeIndex];

    if (!confirm(`¿Estás seguro de eliminar "${recipe.name}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await apiService.deleteRecipe(id);
      showSuccess('Receta eliminada correctamente');

      // Determine which recipe to focus after deletion (next or previous)
      const nextRecipeId = this.appState.recipes[recipeIndex + 1]?.id ||
                           this.appState.recipes[recipeIndex - 1]?.id ||
                           null;

      await this.loadRecipes();

      // Focus on the nearest recipe after reload
      if (nextRecipeId) {
        setTimeout(() => {
          const recipeElement = document.querySelector(`[data-recipe-id="${nextRecipeId}"]`);
          if (recipeElement) {
            recipeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            recipeElement.classList.add('ring-2', 'ring-blue-400');
            setTimeout(() => recipeElement.classList.remove('ring-2', 'ring-blue-400'), 2000);
          }
        }, 100);
      }
    } catch (error) {
      showError('Error al eliminar la receta');
      console.error('Delete recipe error:', error);
    }
  }

  /**
   * Closes the recipe view modal
   */
  closeViewModal() {
    document.getElementById('recipeModal').classList.add('hidden');
  }

  /**
   * Closes the recipe edit modal
   */
  closeEditModal() {
    document.getElementById('editRecipeModal').classList.add('hidden');
    this.appState.editingRecipeId = null;
  }

  /**
   * Resets a form to its initial state
   * @param {string} formId - ID of the form to reset
   */
  resetForm(formId) {
    document.getElementById(formId)?.reset();
  }

  /**
   * Toggles between grid and list view
   * @param {string} view - 'grid' or 'list'
   */
  setView(view) {
    this.appState.currentView = view;
    this.renderRecipes();

    const gridBtn = document.getElementById('gridViewBtn');
    const listBtn = document.getElementById('listViewBtn');

    if (gridBtn) {
      gridBtn.classList.toggle('active', view === 'grid');
      gridBtn.classList.toggle('bg-blue-600', view === 'grid');
    }
    if (listBtn) {
      listBtn.classList.toggle('active', view === 'list');
      listBtn.classList.toggle('bg-blue-600', view === 'list');
    }
  }
}
