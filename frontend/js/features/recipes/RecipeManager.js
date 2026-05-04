import { CONFIG } from '../../config.js';
import { apiService } from '../../apiService.js';
import { UIHelpers } from '../../uiHelpers.js';
import { RecipeCard } from '../../shared/components/RecipeCard.js';
import { escapeHtml, showSuccess, showError } from '../../utils.js';

/**
 * Recipe Manager - Handles all recipe CRUD operations and rendering
 */
export class RecipeManager {
  constructor(appState) {
    this.appState = appState;
    this.items = [];
    this.containerId = 'recipesList';
    this.searchInputId = 'recipeSearch';
  }

  async loadRecipes() {
    try {
      this.items = await apiService.getAllRecipes();
      this.appState.set('recipes', this.items);
      this.render();
    } catch (error) {
      showError('Error al cargar recetas');
      console.error('Load recipes error:', error);
    }
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const searchTerm = document.getElementById(this.searchInputId)?.value?.toLowerCase().trim() || '';
    const filtered = this.filterRecipes(searchTerm);
    const sorted = this.sortRecipes(filtered, this.appState.get('recipeSortOrder'));

    if (sorted.length === 0) {
      this.renderEmpty(container, searchTerm);
      return;
    }

    container.className = this.appState.get('currentView') === CONFIG.VIEWS.GRID
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      : 'flex flex-col gap-3';

    container.innerHTML = sorted.map(recipe => this.renderRecipe(recipe)).join('');
  }

  renderEmpty(container, searchTerm) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-gray-500">
        <i class="fas fa-search text-4xl mb-4"></i>
        <p>${searchTerm ? 'No se encontraron recetas' : 'No hay recetas disponibles'}</p>
        ${searchTerm ? '<button onclick="document.getElementById(\'recipeSearch\').value=\'\';window.recipeManager.render()" class="mt-4 text-blue-600 underline">Limpiar búsqueda</button>' : ''}
      </div>
    `;
  }

  renderRecipe(recipe) {
    const isGrid = this.appState.get('currentView') === CONFIG.VIEWS.GRID;
    const options = {
      onView: 'window.recipeManager.viewRecipe',
      onEdit: 'window.recipeManager.editRecipe',
      onDelete: 'window.recipeManager.deleteRecipe'
    };

    if (isGrid) {
      return RecipeCard.render(recipe, options);
    } else {
      return RecipeCard.renderListItem(recipe, options);
    }
  }

  filterRecipes(searchTerm) {
    let filtered = this.items.filter(recipe => {
      const category = recipe.category || 'general';
      const filters = this.appState.get('categoryFilters');

      if (filters[category] !== false) return true;
      if (category === 'general' && (filters['comida'] !== false || filters['cena'] !== false)) return true;
      return false;
    });

    if (!searchTerm) return filtered;

    const isTimeFilter = !isNaN(parseInt(searchTerm));

    return filtered.filter(recipe => {
      const matchesName = recipe.name?.toLowerCase().includes(searchTerm);
      const matchesCategory = recipe.category?.toLowerCase().includes(searchTerm);
      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      const matchesTime = isTimeFilter && totalTime <= parseInt(searchTerm);

      return matchesName || matchesCategory || matchesTime;
    });
  }

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

  async viewRecipe(id) {
    let recipe = this.items.find(r => r.id === id);
    
    // If not in local cache, fetch from API
    if (!recipe) {
      try {
        recipe = await apiService.getRecipe(id);
        if (!recipe) {
          showError('Receta no encontrada');
          return;
        }
      } catch (error) {
        showError('Error al cargar la receta');
        console.error('View recipe error:', error);
        return;
      }
    }

    document.getElementById('modalRecipeName').textContent = recipe.name;
    document.getElementById('modalRecipeContent').innerHTML = this.renderRecipeDetails(recipe);
    document.getElementById('recipeModal').classList.add('active');
  }

  renderRecipeDetails(recipe) {
    const formattedInstructions = recipe.instructions
      ? recipe.instructions.split('\n').map(line => line.trim()).filter(line => line)
      : [];
    const instructionsHtml = formattedInstructions.length
      ? formattedInstructions.map((line, index) => {
          const stepMatch = line.match(/^(\d+)[.\-)\s]*/);
          if (stepMatch) {
            return `<li class="py-1 pl-2">${escapeHtml(line.replace(/^\d+[.\-)\s]*/, '').trim())}</li>`;
          }
          return `<li class="py-1 pl-2">${escapeHtml(line)}</li>`;
        }).join('')
      : '<li class="text-gray-500">Sin instrucciones</li>';

    return `
      <div class="space-y-5">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 class="font-semibold text-gray-900 text-lg mb-3">
            <i class="fas fa-clock mr-2 text-blue-600"></i>Información
          </h4>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="bg-white p-3 rounded border border-gray-200 flex items-center">
              ${UIHelpers.getCategoryBadge(recipe.category)}
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
          <ol class="list-decimal list-inside text-gray-800 space-y-1 bg-white p-3 rounded border border-gray-200">
            ${instructionsHtml}
          </ol>
        </div>
      </div>
    `;
  }

  async editRecipe(id) {
    let recipe = this.items.find(r => r.id === id);
    
    // If not in local cache, fetch from API
    if (!recipe) {
      try {
        recipe = await apiService.getRecipe(id);
        if (!recipe) {
          showError('Receta no encontrada');
          return;
        }
      } catch (error) {
        showError('Error al cargar la receta');
        console.error('Edit recipe error:', error);
        return;
      }
    }

    this.appState.set('editingRecipeId', id);

    document.getElementById('editRecipeId').value = recipe.id;
    document.getElementById('editRecipeName').value = recipe.name;
    document.getElementById('editRecipeCategory').value = recipe.category;
    document.getElementById('editRecipePrepTime').value = recipe.prepTime || 0;
    document.getElementById('editRecipeCookTime').value = recipe.cookTime || 0;
    document.getElementById('editRecipeIngredients').value = recipe.ingredients || '';
    document.getElementById('editRecipeInstructions').value = recipe.instructions || '';

    document.getElementById('editRecipeModal').classList.add('active');
  }

  async saveRecipe(event) {
    event.preventDefault();

    const isEditing = !!this.appState.get('editingRecipeId');

    const recipeData = {
      name: document.getElementById(isEditing ? 'editRecipeName' : 'recipeName').value.trim(),
      category: document.getElementById(isEditing ? 'editRecipeCategory' : 'recipeCategory').value,
      prepTime: parseInt(document.getElementById(isEditing ? 'editRecipePrepTime' : 'recipePrepTime').value) || 0,
      cookTime: parseInt(document.getElementById(isEditing ? 'editRecipeCookTime' : 'recipeCookTime').value) || 0,
      ingredients: document.getElementById(isEditing ? 'editRecipeIngredients' : 'recipeIngredients').value.trim(),
      instructions: document.getElementById(isEditing ? 'editRecipeInstructions' : 'recipeInstructions').value.trim()
    };

    try {
      if (isEditing) {
        await apiService.updateRecipe(this.appState.get('editingRecipeId'), recipeData);
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

  async deleteRecipe(id) {
    let recipeIndex = this.items.findIndex(r => r.id === id);
    let recipe = this.items[recipeIndex];
    
    // If not in local cache, fetch from API
    if (!recipe) {
      try {
        recipe = await apiService.getRecipe(id);
        if (!recipe) {
          showError('Receta no encontrada');
          return;
        }
      } catch (error) {
        showError('Error al cargar la receta');
        console.error('Delete recipe error:', error);
        return;
      }
    }

    if (!confirm(`¿Estás seguro de eliminar "${recipe.name}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await apiService.deleteRecipe(id);
      showSuccess('Receta eliminada correctamente');

      const nextRecipeId = this.items[recipeIndex + 1]?.id ||
                           this.items[recipeIndex - 1]?.id ||
                           null;

      await this.loadRecipes();

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

  closeViewModal() {
    document.getElementById('recipeModal').classList.remove('active');
  }

  closeEditModal() {
    document.getElementById('editRecipeModal').classList.remove('active');
    this.appState.set('editingRecipeId', null);
  }

  resetForm(formId) {
    document.getElementById(formId)?.reset();
  }

  setView(view) {
    this.appState.set('currentView', view);
    this.render();

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
