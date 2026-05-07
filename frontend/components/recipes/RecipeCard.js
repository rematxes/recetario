import { UIHelpers } from '../../js/uiHelpers.js';
import { escapeHtml } from '../../js/utils.js';

/**
 * ============================================
 * UNIFIED RECIPE CARD COMPONENT
 * ============================================
 * 
 * Unified recipe card component that handles grid, list, and compact views
 */

export class RecipeCard {
  constructor({
    recipe,
    viewMode = 'grid', // grid, list, compact
    onView = null,
    onEdit = null,
    onDelete = null,
    onSelect = null,
    showActions = true
  } = {}) {
    this.recipe = recipe;
    this.viewMode = viewMode;
    this.onView = onView;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
    this.onSelect = onSelect;
    this.showActions = showActions;
  }

  render() {
    switch (this.viewMode) {
      case 'list':
        return this.renderListView();
      case 'compact':
        return this.renderCompactView();
      case 'grid':
      default:
        return this.renderGridView();
    }
  }

  renderGridView() {
    const categoryBadge = UIHelpers.getCategoryBadge(this.recipe.category);
    const timeBadges = UIHelpers.getTimeBadges(this.recipe);

    return `
      <div class="card bg-white border-2 border-gray-300 rounded-lg p-5 hover:shadow-lg hover:border-blue-400 transition-all" data-recipe-id="${this.recipe.id}">
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-bold text-lg text-gray-900">${escapeHtml(this.recipe.name)}</h3>
          ${categoryBadge}
        </div>
        
        <div class="flex flex-nowrap gap-1 mb-3 bg-gray-50 rounded p-1.5 overflow-hidden">
          ${timeBadges}
        </div>
        
        ${this.showActions ? this.renderActions() : ''}
      </div>
    `;
  }

  renderListView() {
    const totalTime = (this.recipe.prepTime || 0) + (this.recipe.cookTime || 0);

    return `
      <div class="flex items-center justify-between p-4 bg-white border-2 border-gray-300 rounded-lg hover:shadow-md hover:border-blue-400 transition-all" data-recipe-id="${this.recipe.id}">
        <div class="flex-1 min-w-0 mr-4">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-bold text-gray-900 truncate">${escapeHtml(this.recipe.name)}</h3>
            ${UIHelpers.getCategoryBadge(this.recipe.category)}
          </div>
          <div class="flex gap-2 mt-2 text-xs">
            <span class="text-gray-500"><i class="fas fa-clock mr-1 text-blue-500"></i>${this.recipe.prepTime || 0}min</span>
            <span class="text-gray-500"><i class="fas fa-fire mr-1 text-orange-500"></i>${this.recipe.cookTime || 0}min</span>
            <span class="text-gray-500"><i class="fas fa-hourglass-half mr-1 text-green-500"></i>${totalTime}min</span>
          </div>
        </div>
        
        <div class="flex gap-2 flex-shrink-0">
          ${this.onView ? `
            <button onclick="${this.onView}('${this.recipe.id}')" class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <i class="fas fa-eye mr-1"></i>Ver
            </button>
          ` : ''}
          ${this.onEdit ? `
            <button onclick="${this.onEdit}('${this.recipe.id}')" class="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
              <i class="fas fa-edit mr-1"></i>Editar
            </button>
          ` : ''}
          ${this.onDelete ? `
            <button onclick="${this.onDelete}('${this.recipe.id}')" class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              <i class="fas fa-trash mr-1"></i>Borrar
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderCompactView() {
    const totalTime = (this.recipe.prepTime || 0) + (this.recipe.cookTime || 0);
    const clickHandler = this.onSelect ? `onclick="${this.onSelect}('${this.recipe.id}')"` : '';

    return `
      <div class="card bg-white border-2 border-gray-300 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer" 
           ${clickHandler}
           data-recipe-id="${this.recipe.id}">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-base text-gray-900 line-clamp-2">${escapeHtml(this.recipe.name)}</h3>
          ${UIHelpers.getCategoryBadge(this.recipe.category)}
        </div>
        
        <div class="text-xs text-gray-500 flex flex-wrap gap-2">
          <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            <i class="fas fa-clock mr-1"></i>${this.recipe.prepTime || 0}min
          </span>
          <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded">
            <i class="fas fa-fire mr-1"></i>${this.recipe.cookTime || 0}min
          </span>
          <span class="bg-green-100 text-green-800 px-2 py-1 rounded">
            <i class="fas fa-hourglass-half mr-1"></i>${totalTime}min
          </span>
        </div>
        
        ${this.onSelect ? `
          <div class="mt-3 text-center">
            <span class="text-blue-600 text-sm font-medium hover:underline">
              <i class="fas fa-check-circle mr-1"></i>Click para seleccionar
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderActions() {
    return `
      <div class="flex gap-2 mt-auto">
        ${this.onView ? `
          <button onclick="${this.onView}('${this.recipe.id}')" 
            class="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-semibold transition-colors">
            <i class="fas fa-eye mr-1"></i>Ver
          </button>
        ` : ''}
        ${this.onEdit ? `
          <button onclick="${this.onEdit}('${this.recipe.id}')" 
            class="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-semibold transition-colors">
            <i class="fas fa-edit mr-1"></i>Editar
          </button>
        ` : ''}
        ${this.onDelete ? `
          <button onclick="${this.onDelete}('${this.recipe.id}')" 
            class="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold transition-colors">
            <i class="fas fa-trash mr-1"></i>Borrar
          </button>
        ` : ''}
      </div>
    `;
  }
}

export const createRecipeCard = (options) => new RecipeCard(options);
