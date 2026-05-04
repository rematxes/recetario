import { UIHelpers } from '../../uiHelpers.js';
import { escapeHtml } from '../../utils.js';

/**
 * Reusable Recipe Card Component
 */
export class RecipeCard {
  static render(recipe, options = {}) {
    const { 
      showActions = true, 
      onView, 
      onEdit, 
      onDelete,
      onSelect,
      isCompact = false 
    } = options;

    if (isCompact) {
      return this.renderCompact(recipe, onSelect);
    }

    const categoryBadge = UIHelpers.getCategoryBadge(recipe.category);
    const timeBadges = UIHelpers.getTimeBadges(recipe);

    return `
      <div class="card bg-white border-2 border-gray-300 rounded-lg p-5 hover:shadow-lg hover:border-blue-400 transition-all" data-recipe-id="${recipe.id}">
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-bold text-lg text-gray-900">${escapeHtml(recipe.name)}</h3>
          ${categoryBadge}
        </div>
        
        <div class="flex flex-nowrap gap-1 mb-3 bg-gray-50 rounded p-1.5 overflow-hidden">
          ${timeBadges}
        </div>
        
        ${showActions ? this.renderActions(recipe, onView, onEdit, onDelete) : ''}
      </div>
    `;
  }

  static renderCompact(recipe, onSelect = null) {
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
    const clickHandler = onSelect ? `onclick="${onSelect}('${recipe.id}')"` : '';

    return `
      <div class="card bg-white border-2 border-gray-300 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer" 
           ${clickHandler}
           data-recipe-id="${recipe.id}">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-base text-gray-900 line-clamp-2">${escapeHtml(recipe.name)}</h3>
          ${UIHelpers.getCategoryBadge(recipe.category)}
        </div>
        
        <div class="text-xs text-gray-500 flex flex-wrap gap-2">
          <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            <i class="fas fa-clock mr-1"></i>${recipe.prepTime || 0}min
          </span>
          <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded">
            <i class="fas fa-fire mr-1"></i>${recipe.cookTime || 0}min
          </span>
          <span class="bg-green-100 text-green-800 px-2 py-1 rounded">
            <i class="fas fa-hourglass-half mr-1"></i>${totalTime}min
          </span>
        </div>
        
        ${onSelect ? `
          <div class="mt-3 text-center">
            <span class="text-blue-600 text-sm font-medium hover:underline">
              <i class="fas fa-check-circle mr-1"></i>Click para seleccionar
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }

  static renderListItem(recipe, options = {}) {
    const { onView, onEdit, onDelete } = options;
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

    return `
      <div class="flex items-center justify-between p-4 bg-white border-2 border-gray-300 rounded-lg hover:shadow-md hover:border-blue-400 transition-all" data-recipe-id="${recipe.id}">
        <div class="flex-1 min-w-0 mr-4">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-bold text-gray-900 truncate">${escapeHtml(recipe.name)}</h3>
            ${UIHelpers.getCategoryBadge(recipe.category)}
          </div>
          <div class="flex gap-2 mt-2 text-xs">
            <span class="text-gray-500"><i class="fas fa-clock mr-1 text-blue-500"></i>${recipe.prepTime || 0}min</span>
            <span class="text-gray-500"><i class="fas fa-fire mr-1 text-orange-500"></i>${recipe.cookTime || 0}min</span>
            <span class="text-gray-500"><i class="fas fa-hourglass-half mr-1 text-green-500"></i>${totalTime}min</span>
          </div>
        </div>
        
        <div class="flex gap-2 flex-shrink-0">
          ${onView ? `
            <button onclick="${onView}('${recipe.id}')" class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <i class="fas fa-eye mr-1"></i>Ver
            </button>
          ` : ''}
          ${onEdit ? `
            <button onclick="${onEdit}('${recipe.id}')" class="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
              <i class="fas fa-edit mr-1"></i>Editar
            </button>
          ` : ''}
          ${onDelete ? `
            <button onclick="${onDelete}('${recipe.id}')" class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              <i class="fas fa-trash mr-1"></i>Borrar
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  static renderActions(recipe, onView, onEdit, onDelete) {
    return `
      <div class="flex gap-2 mt-auto">
        ${onView ? `
          <button onclick="${onView}('${recipe.id}')" 
            class="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-semibold transition-colors">
            <i class="fas fa-eye mr-1"></i>Ver
          </button>
        ` : ''}
        ${onEdit ? `
          <button onclick="${onEdit}('${recipe.id}')" 
            class="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-semibold transition-colors">
            <i class="fas fa-edit mr-1"></i>Editar
          </button>
        ` : ''}
        ${onDelete ? `
          <button onclick="${onDelete}('${recipe.id}')" 
            class="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold transition-colors">
            <i class="fas fa-trash mr-1"></i>Borrar
          </button>
        ` : ''}
      </div>
    `;
  }
}
