/**
 * ============================================
 * RECIPE & MENU MANAGER - FRONTEND APPLICATION
 * ============================================
 * 
 * A clean, modular JavaScript application for managing recipes
 * and generating weekly menus. Designed for mobile and desktop use.
 * 
 * Architecture: Module Pattern with clear separation of concerns
 * Storage: JSON files via REST API
 * Styling: Tailwind CSS
 * 
 * @author Assistant
 * @version 2.0.0
 */

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

// Detectar la URL base automáticamente
const getApiBase = () => {
  // Si estamos en localhost, usar localhost
  // Si estamos en una IP, usar esa IP
  const { protocol, hostname, port } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  // Para acceso desde otros dispositivos en la red
  return `${protocol}//${hostname}:3000`;
};

const CONFIG = {
  API_BASE: getApiBase(),
  DEFAULT_CATEGORY: 'general',
  DAYS_OF_WEEK: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  MEAL_TYPES: ['comida', 'cena'],
  VIEWS: {
    GRID: 'grid',
    LIST: 'list'
  }
};

const CATEGORY_CONFIG = {
  general: { label: 'General', color: 'gradient', icons: ['fa-sun', 'fa-moon'], gradient: 'from-red-500 to-indigo-500' },
  desayuno: { label: 'Desayuno', color: 'yellow', icon: 'fa-coffee' },
  comida: { label: 'Comida', color: 'red', icon: 'fa-sun' },
  cena: { label: 'Cena', color: 'indigo', icon: 'fa-moon' },
  picoteo: { label: 'Picoteo', color: 'green', icon: 'fa-cookie' },
  dulce: { label: 'Dulce', color: 'pink', icon: 'fa-candy-cane' }
};

const TIME_ICONS = {
  prep: { icon: 'fa-clock', color: 'blue', label: 'Prep' },
  cook: { icon: 'fa-fire', color: 'orange', label: 'Cocción' },
  total: { icon: 'fa-hourglass-half', color: 'green', label: 'Total' }
};

// ============================================
// APPLICATION STATE
// ============================================

const AppState = {
  recipes: [],
  menus: [],
  currentView: CONFIG.VIEWS.GRID,
  expandedMenus: new Set(),
  manualMenuForm: {
    isExpanded: false,
    selectedDay: null,
    selectedMeal: null,
    selectorViewMode: CONFIG.VIEWS.GRID,
    data: {}
  },
  editingRecipeId: null
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - Raw text to escape
 * @returns {string} Escaped HTML string
 */
function escapeHtml(text) {
  if (!text) return '';
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => htmlEntities[char]);
}

/**
 * Formats a date object to Spanish locale string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (DD/MM/YYYY)
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('es-ES');
}

/**
 * Shows a success notification
 * @param {string} message - Message to display
 */
function showSuccess(message) {
  showNotification(message, 'success');
}

/**
 * Shows an error notification
 * @param {string} message - Message to display
 */
function showError(message) {
  showNotification(message, 'error');
}

/**
 * Shows a notification banner
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
function showNotification(message, type) {
  const notification = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  
  notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in`;
  notification.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${escapeHtml(message)}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ============================================
// API SERVICE
// ============================================

const ApiService = {
  /**
   * Makes a fetch request with error handling
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    try {
      const url = `${CONFIG.API_BASE}${endpoint}`;
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  },

  // Recipe CRUD Operations
  recipes: {
    getAll: () => ApiService.request('/api/recipes'),
    create: (data) => ApiService.request('/api/recipes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => ApiService.request(`/api/recipes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => ApiService.request(`/api/recipes/${id}`, { method: 'DELETE' })
  },

  // Menu CRUD Operations
  menus: {
    getAll: () => ApiService.request('/api/menus'),
    generate: (weekStart) => ApiService.request('/api/menus/generate', { 
      method: 'POST', 
      body: JSON.stringify({ weekStart }) 
    }),
    create: (data) => ApiService.request('/api/menus', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => ApiService.request(`/api/menus/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => ApiService.request(`/api/menus/${id}`, { method: 'DELETE' })
  }
};

// ============================================
// UI HELPERS
// ============================================

const UIHelpers = {
  /**
   * Generates HTML for a category badge
   * @param {string} category - Category key
   * @returns {string} HTML string
   */
  getCategoryBadge(category) {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general;
    const { label, color, icons, icon } = config;
    
    const colorClasses = {
      gray: 'bg-gray-100 text-gray-800 border-gray-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      pink: 'bg-pink-100 text-pink-800 border-pink-300'
    };
    
    let iconsHtml = '';
    if (icons) {
      iconsHtml = icons.map(i => `<i class="fas ${i} mr-1"></i>`).join('');
    } else if (icon) {
      iconsHtml = `<i class="fas ${icon} mr-1"></i>`;
    }
    
    // Special case for General with gradient
    if (color === 'gradient' && config.gradient) {
      return `
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-transparent bg-gradient-to-r ${config.gradient} text-white shadow-sm">
          ${iconsHtml}${label}
        </span>
      `;
    }
    
    return `
      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClasses[color]}">
        ${iconsHtml}${label}
      </span>
    `;
  },

  /**
   * Generates HTML for time badges
   * @param {Object} recipe - Recipe object with time data
   * @returns {string} HTML string
   */
  getTimeBadges(recipe) {
    const prep = recipe.prepTime || 0;
    const cook = recipe.cookTime || 0;
    const total = prep + cook;
    
    return `
      <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium text-xs">
        <i class="fas ${TIME_ICONS.prep.icon} mr-1"></i>${TIME_ICONS.prep.label}: ${prep}min
      </span>
      <span class="bg-orange-50 text-orange-700 px-2 py-1 rounded font-medium text-xs">
        <i class="fas ${TIME_ICONS.cook.icon} mr-1"></i>${TIME_ICONS.cook.label}: ${cook}min
      </span>
      <span class="bg-green-50 text-green-700 px-2 py-1 rounded font-medium text-xs">
        <i class="fas ${TIME_ICONS.total.icon} mr-1"></i>${TIME_ICONS.total.label}: ${total}min
      </span>
    `;
  },

  /**
   * Creates a button element with consistent styling
   * @param {Object} config - Button configuration
   * @returns {string} HTML string
   */
  createButton({ icon, label, color, onClick, size = 'sm' }) {
    const sizeClasses = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    };
    
    const colorClasses = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      yellow: 'bg-yellow-600 hover:bg-yellow-700',
      red: 'bg-red-600 hover:bg-red-700',
      green: 'bg-green-600 hover:bg-green-700',
      gray: 'bg-gray-600 hover:bg-gray-700'
    };
    
    return `
      <button onclick="${onClick}" 
        class="${sizeClasses[size]} ${colorClasses[color]} text-white rounded font-medium transition-colors">
        ${icon ? `<i class="fas ${icon} mr-1"></i>` : ''}${label}
      </button>
    `;
  }
};

// ============================================
// RECIPE MANAGEMENT
// ============================================

const RecipeManager = {
  /**
   * Loads all recipes from the API
   */
  async loadRecipes() {
    try {
      AppState.recipes = await ApiService.recipes.getAll();
      this.renderRecipes();
    } catch (error) {
      showError('Error al cargar recetas');
      console.error('Load recipes error:', error);
    }
  },

  /**
   * Renders recipes in the current view (grid or list)
   */
  renderRecipes() {
    const container = document.getElementById('recipesList');
    const searchTerm = document.getElementById('recipeSearch')?.value?.toLowerCase().trim() || '';
    
    const filteredRecipes = this.filterRecipes(AppState.recipes, searchTerm);
    
    if (filteredRecipes.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-gray-500">
          <i class="fas fa-search text-4xl mb-4"></i>
          <p>${searchTerm ? 'No se encontraron recetas' : 'No hay recetas disponibles'}</p>
          ${searchTerm ? '<button onclick="document.getElementById(\'recipeSearch\').value=\'\';RecipeManager.renderRecipes()" class="mt-4 text-blue-600 underline">Limpiar búsqueda</button>' : ''}
        </div>
      `;
      return;
    }

    if (AppState.currentView === CONFIG.VIEWS.GRID) {
      this.renderGridView(container, filteredRecipes);
    } else {
      this.renderListView(container, filteredRecipes);
    }
  },

  /**
   * Filters recipes based on search term
   * @param {Array} recipes - Array of recipe objects
   * @param {string} searchTerm - Search term
   * @returns {Array} Filtered recipes
   */
  filterRecipes(recipes, searchTerm) {
    if (!searchTerm) return recipes;
    
    const isTimeFilter = !isNaN(parseInt(searchTerm));
    
    return recipes.filter(recipe => {
      const matchesName = recipe.name?.toLowerCase().includes(searchTerm);
      const matchesDescription = recipe.description?.toLowerCase().includes(searchTerm);
      const matchesCategory = recipe.category?.toLowerCase().includes(searchTerm);
      
      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      const matchesTime = isTimeFilter && totalTime <= parseInt(searchTerm);
      
      return matchesName || matchesDescription || matchesCategory || matchesTime;
    });
  },

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
          <button onclick="RecipeManager.viewRecipe('${recipe.id}')" 
            class="flex-1 px-3 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
            <i class="fas fa-eye mr-1"></i>Ver
          </button>
          <button onclick="RecipeManager.editRecipe('${recipe.id}')" 
            class="flex-1 px-3 py-2 bg-yellow-600 text-white rounded font-medium hover:bg-yellow-700 transition-colors">
            <i class="fas fa-edit mr-1"></i>Editar
          </button>
          <button onclick="RecipeManager.deleteRecipe('${recipe.id}')" 
            class="px-3 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

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
            <button onclick="RecipeManager.viewRecipe('${recipe.id}')" 
              class="px-3 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
              <i class="fas fa-eye"></i>
            </button>
            <button onclick="RecipeManager.editRecipe('${recipe.id}')" 
              class="px-3 py-2 bg-yellow-600 text-white rounded font-medium hover:bg-yellow-700 transition-colors">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="RecipeManager.deleteRecipe('${recipe.id}')" 
              class="px-3 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Opens modal to view recipe details
   * @param {string} id - Recipe ID
   */
  viewRecipe(id) {
    const recipe = AppState.recipes.find(r => r.id === id);
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
  },

  /**
   * Opens modal to edit a recipe
   * @param {string} id - Recipe ID
   */
  editRecipe(id) {
    const recipe = AppState.recipes.find(r => r.id === id);
    if (!recipe) return;

    AppState.editingRecipeId = id;
    
    // Populate form fields
    document.getElementById('editRecipeId').value = recipe.id;
    document.getElementById('editRecipeName').value = recipe.name;
    document.getElementById('editRecipeCategory').value = recipe.category;
    document.getElementById('editRecipeDescription').value = recipe.description || '';
    document.getElementById('editRecipePrepTime').value = recipe.prepTime || 0;
    document.getElementById('editRecipeCookTime').value = recipe.cookTime || 0;
    document.getElementById('editRecipeIngredients').value = recipe.ingredients || '';
    document.getElementById('editRecipeInstructions').value = recipe.instructions || '';
    
    document.getElementById('editRecipeModal').classList.remove('hidden');
  },

  /**
   * Saves a recipe (create or update)
   * @param {Event} event - Form submit event
   */
  async saveRecipe(event) {
    event.preventDefault();
    
    const isEditing = !!AppState.editingRecipeId;
    
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
        await ApiService.recipes.update(AppState.editingRecipeId, recipeData);
        showSuccess('Receta actualizada correctamente');
        this.closeEditModal();
      } else {
        await ApiService.recipes.create(recipeData);
        showSuccess('Receta creada correctamente');
        this.resetForm('recipeForm');
      }
      
      await this.loadRecipes();
    } catch (error) {
      showError('Error al guardar la receta');
      console.error('Save recipe error:', error);
    }
  },

  /**
   * Deletes a recipe
   * @param {string} id - Recipe ID
   */
  async deleteRecipe(id) {
    const recipe = AppState.recipes.find(r => r.id === id);
    if (!recipe) return;
    
    if (!confirm(`¿Estás seguro de eliminar "${recipe.name}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await ApiService.recipes.delete(id);
      showSuccess('Receta eliminada correctamente');
      await this.loadRecipes();
    } catch (error) {
      showError('Error al eliminar la receta');
      console.error('Delete recipe error:', error);
    }
  },

  /**
   * Closes the recipe view modal
   */
  closeViewModal() {
    document.getElementById('recipeModal').classList.add('hidden');
  },

  /**
   * Closes the recipe edit modal
   */
  closeEditModal() {
    document.getElementById('editRecipeModal').classList.add('hidden');
    AppState.editingRecipeId = null;
  },

  /**
   * Resets a form to its initial state
   * @param {string} formId - ID of the form to reset
   */
  resetForm(formId) {
    document.getElementById(formId).reset();
  },

  /**
   * Toggles between grid and list view
   * @param {string} view - 'grid' or 'list'
   */
  setView(view) {
    AppState.currentView = view;
    this.renderRecipes();
    
    // Update active button state
    document.getElementById('gridViewBtn')?.classList.toggle('bg-blue-600', view === 'grid');
    document.getElementById('listViewBtn')?.classList.toggle('bg-blue-600', view === 'list');
  }
};

// ============================================
// MENU MANAGEMENT
// ============================================

const MenuManager = {
  /**
   * Loads all menus from the API
   */
  async loadMenus() {
    try {
      AppState.menus = await ApiService.menus.getAll();
      this.renderMenus();
    } catch (error) {
      showError('Error al cargar menús');
      console.error('Load menus error:', error);
    }
  },

  /**
   * Renders all menus in the container
   */
  renderMenus() {
    const container = document.getElementById('menusList');
    
    if (AppState.menus.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-gray-500">
          <i class="fas fa-calendar-alt text-4xl mb-4"></i>
          <p>No hay menús generados</p>
          <p class="text-sm mt-2">Genera tu primer menú semanal</p>
        </div>
      `;
      return;
    }

    container.innerHTML = AppState.menus.map((menu, index) => this.renderMenuCard(menu, index)).join('');
  },

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
    const isExpanded = AppState.expandedMenus.has(menu.id);
    
    return `
      <div class="border rounded-lg overflow-hidden">
        <!-- Menu Header -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all" 
             onclick="MenuManager.toggleMenu('${menu.id}')">
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
              <button onclick="event.stopPropagation(); MenuManager.editName('${menu.id}', '${escapeHtml(menuName)}')" 
                class="px-3 py-1 bg-white text-blue-600 rounded text-sm hover:bg-blue-50 font-medium">
                <i class="fas fa-edit mr-1"></i>Editar
              </button>
              <button onclick="event.stopPropagation(); MenuManager.deleteMenu('${menu.id}')" 
                class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 font-medium">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Menu Content (Collapsible) -->
        <div id="menu-content-${menu.id}" class="${isExpanded ? '' : 'hidden'}">
          <div class="p-4 space-y-3">
            ${menu.days.map((day, dayIndex) => this.renderDayCard(day, menu.id, dayIndex)).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Renders a single day card within a menu
   * @param {Object} day - Day object
   * @param {string} menuId - Parent menu ID
   * @param {number} dayIndex - Day index
   * @returns {string} HTML string
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
  },

  /**
   * Renders a meal card (comida or cena)
   * @param {Object} meal - Meal object
   * @param {string} type - 'comida' or 'cena'
   * @param {string} menuId - Parent menu ID
   * @param {number} dayIndex - Day index
   * @returns {string} HTML string
   */
  renderMealCard(meal, type, menuId, dayIndex) {
    const isComida = type === 'comida';
    const config = {
      comida: { label: 'Comida', color: 'red', icon: 'fa-sun' },
      cena: { label: 'Cena', color: 'indigo', icon: 'fa-moon' }
    }[type];
    
    const hasRecipe = meal?.recipeId;
    
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
        
        <div class="font-medium text-gray-900 mb-3 p-2 bg-gray-50 rounded border border-gray-200">
          ${hasRecipe ? escapeHtml(meal.recipeName) : 'No asignado'}
        </div>
        
        <div class="flex gap-2">
          ${hasRecipe ? `
            <button onclick="RecipeManager.viewRecipe('${meal.recipeId}')" 
              class="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 font-medium">
              <i class="fas fa-eye mr-1"></i>Ver
            </button>
          ` : ''}
          <button onclick="MenuManager.substituteRecipe('${menuId}', ${dayIndex}, '${type}')" 
            class="flex-1 px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 font-medium">
            <i class="fas fa-exchange-alt mr-1"></i>Cambiar
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Toggles menu expansion
   * @param {string} menuId - Menu ID
   */
  toggleMenu(menuId) {
    const content = document.getElementById(`menu-content-${menuId}`);
    const chevron = document.getElementById(`menu-chevron-${menuId}`);
    
    if (AppState.expandedMenus.has(menuId)) {
      AppState.expandedMenus.delete(menuId);
      content.classList.add('hidden');
      chevron.style.transform = 'rotate(0deg)';
    } else {
      AppState.expandedMenus.add(menuId);
      content.classList.remove('hidden');
      chevron.style.transform = 'rotate(180deg)';
    }
  },

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
      await ApiService.menus.generate(weekStart);
      showSuccess('Menú generado correctamente');
      await this.loadMenus();
    } catch (error) {
      showError('Error al generar el menú');
      console.error('Generate menu error:', error);
    }
  },

  /**
   * State for recipe substitution selector
   */
  substitutionState: {
    menuId: null,
    dayIndex: null,
    mealType: null,
    viewMode: 'grid'
  },

  /**
   * Opens recipe selector for substitution
   * @param {string} menuId - Menu ID
   * @param {number} dayIndex - Day index
   * @param {string} mealType - 'comida' or 'cena'
   */
  openSubstitutionSelector(menuId, dayIndex, mealType) {
    // Store state for later use
    this.substitutionState = { menuId, dayIndex, mealType, viewMode: 'grid' };
    
    // Reset search
    document.getElementById('recipeSelectorSearch').value = '';
    
    // Render available recipes
    this.renderSubstitutionSelector();
    
    // Show modal
    document.getElementById('recipeSelectorModal').classList.remove('hidden');
    
    // Ensure menu stays expanded
    AppState.expandedMenus.add(menuId);
  },

  /**
   * Renders recipes in the substitution selector
   */
  renderSubstitutionSelector() {
    const container = document.getElementById('recipeSelectorResults');
    const searchTerm = document.getElementById('recipeSelectorSearch').value.toLowerCase().trim();
    const { mealType } = this.substitutionState;
    
    // Filter recipes based on meal type compatibility
    let recipes = AppState.recipes.filter(recipe => {
      if (mealType === 'comida') {
        return ['comida', 'general'].includes(recipe.category);
      } else if (mealType === 'cena') {
        return ['cena', 'general'].includes(recipe.category);
      }
      return true;
    });
    
    // Apply search filter
    if (searchTerm) {
      recipes = recipes.filter(recipe => {
        const matchesName = recipe.name?.toLowerCase().includes(searchTerm);
        const matchesCategory = recipe.category?.toLowerCase().includes(searchTerm);
        const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
        const matchesTime = !isNaN(parseInt(searchTerm)) && totalTime <= parseInt(searchTerm);
        return matchesName || matchesCategory || matchesTime;
      });
    }

    if (recipes.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">No hay recetas disponibles para esta comida</p>';
      return;
    }

    const isGrid = this.substitutionState.viewMode === 'grid';
    
    if (isGrid) {
      container.innerHTML = recipes.map(recipe => `
        <div class="card bg-white border-2 border-gray-300 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer" 
             onclick="MenuManager.selectSubstitutionRecipe('${recipe.id}')">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-bold text-lg text-gray-900">${escapeHtml(recipe.name)}</h4>
            ${UIHelpers.getCategoryBadge(recipe.category)}
          </div>
          <p class="text-gray-700 text-sm mb-3 bg-gray-50 p-2 rounded">${escapeHtml(recipe.description || 'Sin descripción')}</p>
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
             onclick="MenuManager.selectSubstitutionRecipe('${recipe.id}')">
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
  },

  /**
   * Handles recipe selection for substitution
   * @param {string} recipeId - Selected recipe ID
   */
  async selectSubstitutionRecipe(recipeId) {
    const recipe = AppState.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const { menuId, dayIndex, mealType } = this.substitutionState;
    
    const menu = AppState.menus.find(m => m.id === menuId);
    if (!menu) return;

    // Update menu with selected recipe
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
      await ApiService.menus.update(menuId, { days: updatedDays });
      
      // Close selector
      document.getElementById('recipeSelectorModal').classList.add('hidden');
      
      // Keep menu expanded and reload
      AppState.expandedMenus.add(menuId);
      await this.loadMenus();
      
      // Scroll to the changed meal
      setTimeout(() => {
        const dayElement = document.querySelector(`[data-day-index="${dayIndex}"][data-menu-id="${menuId}"]`);
        if (dayElement) {
          dayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the changed meal
          dayElement.classList.add('ring-2', 'ring-blue-400');
          setTimeout(() => dayElement.classList.remove('ring-2', 'ring-blue-400'), 2000);
        }
      }, 100);
      
      showSuccess(`Receta cambiada a "${recipe.name}"`);
    } catch (error) {
      showError('Error al cambiar la receta');
      console.error('Substitute recipe error:', error);
    }
  },

  /**
   * Toggles substitution selector view mode
   * @param {string} mode - 'grid' or 'list'
   */
  toggleSubstitutionView(mode) {
    this.substitutionState.viewMode = mode;
    this.renderSubstitutionSelector();
    
    document.getElementById('selectorGridViewBtn')?.classList.toggle('bg-blue-600', mode === 'grid');
    document.getElementById('selectorListViewBtn')?.classList.toggle('bg-blue-600', mode === 'list');
  },

  /**
   * Substitutes a recipe in a menu (opens selector)
   * @param {string} menuId - Menu ID
   * @param {number} dayIndex - Day index
   * @param {string} mealType - 'comida' or 'cena'
   */
  substituteRecipe(menuId, dayIndex, mealType) {
    this.openSubstitutionSelector(menuId, dayIndex, mealType);
  },

  /**
   * Edits a menu name
   * @param {string} menuId - Menu ID
   * @param {string} currentName - Current menu name
   */
  async editName(menuId, currentName) {
    const newName = prompt('Editar nombre del menú:', currentName);
    if (newName === null || newName.trim() === '') return;

    const menu = AppState.menus.find(m => m.id === menuId);
    if (!menu) return;

    try {
      await ApiService.menus.update(menuId, { 
        name: newName.trim(),
        days: menu.days 
      });
      showSuccess('Nombre actualizado correctamente');
      await this.loadMenus();
    } catch (error) {
      showError('Error al actualizar el nombre');
      console.error('Edit name error:', error);
    }
  },

  /**
   * Deletes a menu
   * @param {string} menuId - Menu ID
   */
  async deleteMenu(menuId) {
    const menu = AppState.menus.find(m => m.id === menuId);
    const menuName = menu?.name || 'este menú';
    
    if (!confirm(`¿Eliminar "${menuName}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await ApiService.menus.delete(menuId);
      AppState.expandedMenus.delete(menuId);
      showSuccess('Menú eliminado correctamente');
      await this.loadMenus();
    } catch (error) {
      showError('Error al eliminar el menú');
      console.error('Delete menu error:', error);
    }
  }
};

// ============================================
// MANUAL MENU CREATION
// ============================================

const ManualMenuManager = {
  /**
   * Toggles the manual menu form visibility
   */
  toggleForm() {
    const form = document.getElementById('manualMenuForm');
    const btn = document.getElementById('toggleManualMenuBtn');
    
    AppState.manualMenuForm.isExpanded = !AppState.manualMenuForm.isExpanded;
    
    if (AppState.manualMenuForm.isExpanded) {
      form.classList.remove('hidden');
      btn.innerHTML = '<i class="fas fa-chevron-up mr-2"></i>Ocultar Formulario';
      btn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
      btn.classList.add('bg-red-500', 'hover:bg-red-600');
      this.initGrid();
    } else {
      form.classList.add('hidden');
      btn.innerHTML = '<i class="fas fa-calendar-plus mr-2"></i>Rellenar Manualmente';
      btn.classList.remove('bg-red-500', 'hover:bg-red-600');
      btn.classList.add('bg-blue-500', 'hover:bg-blue-600');
    }
  },

  /**
   * Initializes the manual menu grid
   */
  initGrid() {
    const grid = document.getElementById('manualMenuGrid');
    const startDate = document.getElementById('manualMenuStartDate').value;
    
    if (!startDate) {
      grid.innerHTML = '<p class="text-gray-500 text-center">Selecciona una fecha de inicio</p>';
      return;
    }

    const baseDate = new Date(startDate);
    
    grid.innerHTML = CONFIG.DAYS_OF_WEEK.map((dayName, index) => {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + index);
      
      const dayData = AppState.manualMenuForm.data[index] || {};
      
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
              <button onclick="ManualMenuManager.openRecipeSelector(${index}, 'comida')" 
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
              <button onclick="ManualMenuManager.openRecipeSelector(${index}, 'cena')" 
                class="w-full px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600 font-medium">
                ${dayData.cena ? 'Cambiar' : 'Seleccionar'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Opens the recipe selector modal
   * @param {number} dayIndex - Day index
   * @param {string} mealType - 'comida' or 'cena'
   */
  openRecipeSelector(dayIndex, mealType) {
    AppState.manualMenuForm.selectedDay = dayIndex;
    AppState.manualMenuForm.selectedMeal = mealType;
    
    // Reset search
    document.getElementById('recipeSelectorSearch').value = '';
    AppState.manualMenuForm.selectorViewMode = CONFIG.VIEWS.GRID;
    
    this.renderRecipeSelector();
    document.getElementById('recipeSelectorModal').classList.remove('hidden');
  },

  /**
   * Closes the recipe selector modal
   */
  closeRecipeSelector() {
    document.getElementById('recipeSelectorModal').classList.add('hidden');
    AppState.manualMenuForm.selectedDay = null;
    AppState.manualMenuForm.selectedMeal = null;
  },

  /**
   * Renders recipes in the selector modal
   */
  renderRecipeSelector() {
    const container = document.getElementById('recipeSelectorResults');
    const searchTerm = document.getElementById('recipeSelectorSearch').value.toLowerCase().trim();
    const mealType = AppState.manualMenuForm.selectedMeal;
    
    // Filter recipes based on meal type compatibility
    let recipes = AppState.recipes.filter(recipe => {
      if (mealType === 'comida') {
        return ['comida', 'general'].includes(recipe.category);
      } else if (mealType === 'cena') {
        return ['cena', 'general'].includes(recipe.category);
      }
      return true;
    });
    
    // Apply search filter
    if (searchTerm) {
      recipes = RecipeManager.filterRecipes(recipes, searchTerm);
    }

    if (recipes.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">No hay recetas disponibles</p>';
      return;
    }

    const isGrid = AppState.manualMenuForm.selectorViewMode === CONFIG.VIEWS.GRID;
    
    if (isGrid) {
      this.renderSelectorGrid(container, recipes);
    } else {
      this.renderSelectorList(container, recipes);
    }
  },

  /**
   * Renders selector in grid view
   * @param {HTMLElement} container - Container element
   * @param {Array} recipes - Array of recipe objects
   */
  renderSelectorGrid(container, recipes) {
    container.innerHTML = recipes.map(recipe => `
      <div class="card border rounded-lg p-4 hover:shadow-md cursor-pointer bg-white" 
           onclick="ManualMenuManager.selectRecipe('${recipe.id}')">
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-bold text-sm">${escapeHtml(recipe.name)}</h4>
          ${UIHelpers.getCategoryBadge(recipe.category)}
        </div>
        <p class="text-gray-600 text-xs mb-2">${escapeHtml(recipe.description || 'Sin descripción')}</p>
        <div class="text-xs text-gray-500">
          <i class="fas fa-hourglass-half text-green-500 mr-1"></i>
          ${(recipe.prepTime || 0) + (recipe.cookTime || 0)}min total
        </div>
      </div>
    `).join('');
  },

  /**
   * Renders selector in list view
   * @param {HTMLElement} container - Container element
   * @param {Array} recipes - Array of recipe objects
   */
  renderSelectorList(container, recipes) {
    container.innerHTML = recipes.map(recipe => `
      <div class="border rounded-lg p-3 hover:shadow-md cursor-pointer bg-white flex justify-between items-center"
           onclick="ManualMenuManager.selectRecipe('${recipe.id}')">
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
  },

  /**
   * Selects a recipe for the manual menu
   * @param {string} recipeId - Recipe ID
   */
  selectRecipe(recipeId) {
    const recipe = AppState.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const { selectedDay, selectedMeal } = AppState.manualMenuForm;
    
    if (selectedDay === null || !selectedMeal) return;

    // Initialize day data if needed
    if (!AppState.manualMenuForm.data[selectedDay]) {
      AppState.manualMenuForm.data[selectedDay] = {};
    }

    // Store selected recipe
    AppState.manualMenuForm.data[selectedDay][selectedMeal] = {
      recipeId: recipe.id,
      recipeName: recipe.name,
      prepTime: recipe.prepTime || 0,
      cookTime: recipe.cookTime || 0,
      totalTime: (recipe.prepTime || 0) + (recipe.cookTime || 0)
    };

    this.closeRecipeSelector();
    this.initGrid();
  },

  /**
   * Toggles selector view mode
   * @param {string} mode - 'grid' or 'list'
   */
  toggleSelectorView(mode) {
    AppState.manualMenuForm.selectorViewMode = mode;
    this.renderRecipeSelector();
    
    // Update button states
    document.getElementById('selectorGridViewBtn')?.classList.toggle('bg-blue-600', mode === 'grid');
    document.getElementById('selectorListViewBtn')?.classList.toggle('bg-blue-600', mode === 'list');
  },

  /**
   * Saves the manual menu
   */
  async save() {
    const startDate = document.getElementById('manualMenuStartDate').value;
    
    if (!startDate) {
      showError('Selecciona una fecha de inicio');
      return;
    }

    const baseDate = new Date(startDate);
    const menuDays = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + i);

      const dayData = AppState.manualMenuForm.data[i] || {};

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
      await ApiService.menus.create({
        weekStart: baseDate.toISOString(),
        days: menuDays
      });

      showSuccess('Menú guardado correctamente');
      this.clear();
      MenuManager.loadMenus();
    } catch (error) {
      showError('Error al guardar el menú');
      console.error('Save manual menu error:', error);
    }
  },

  /**
   * Clears the manual menu form
   */
  clear() {
    AppState.manualMenuForm.data = {};
    document.getElementById('manualMenuStartDate').value = '';
    this.initGrid();
  }
};

// ============================================
// TAB MANAGEMENT
// ============================================

const TabManager = {
  /**
   * Switches between tabs
   * @param {string} tabName - 'recipes' or 'menus'
   */
  switchTab(tabName) {
    // Hide all tabs by removing 'active' class
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Show selected tab by adding 'active' class
    const tabId = tabName === 'recipes' ? 'recipes-tab' : 'menus-tab';
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }
    
    // Update desktop navigation button styles
    const desktopNav = document.querySelector('.hidden.md\\:flex.mb-6');
    if (desktopNav) {
      const buttons = desktopNav.querySelectorAll('button');
      buttons.forEach(btn => {
        const isRecipesTab = tabName === 'recipes';
        if (btn.innerHTML.includes('Recetas')) {
          btn.classList.toggle('bg-blue-500', isRecipesTab);
          btn.classList.toggle('bg-green-500', !isRecipesTab);
        } else if (btn.innerHTML.includes('Menús')) {
          btn.classList.toggle('bg-green-500', isRecipesTab);
          btn.classList.toggle('bg-blue-500', !isRecipesTab);
        }
      });
    }
    
    // Load data for the tab
    if (tabName === 'recipes') {
      RecipeManager.loadRecipes();
    } else if (tabName === 'menus') {
      MenuManager.loadMenus();
    }
  }
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initializes the application when DOM is ready
 */
function initApp() {
  // Set up event listeners
  setupEventListeners();
  
  // Ensure recipes tab is active by default
  const recipesTab = document.getElementById('recipes-tab');
  const menusTab = document.getElementById('menus-tab');
  if (recipesTab) recipesTab.classList.add('active');
  if (menusTab) menusTab.classList.remove('active');
  
  // Load initial data
  RecipeManager.loadRecipes();
  
  // Set default date for menu generation
  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
  
  const menuDateInput = document.getElementById('menuWeekStart');
  if (menuDateInput) {
    menuDateInput.valueAsDate = nextMonday;
  }
  
  // Log current API base for debugging
  console.log('API Base URL:', CONFIG.API_BASE);
  console.log('Recipe & Menu Manager initialized successfully');
}

/**
 * Sets up all event listeners
 */
function setupEventListeners() {
  // Recipe form submission
  document.getElementById('recipeForm')?.addEventListener('submit', (e) => {
    RecipeManager.saveRecipe(e);
  });
  
  // Edit recipe form submission
  document.getElementById('editRecipeForm')?.addEventListener('submit', (e) => {
    RecipeManager.saveRecipe(e);
  });
  
  // Recipe search input
  document.getElementById('recipeSearch')?.addEventListener('input', () => {
    RecipeManager.renderRecipes();
  });
  
  // Recipe selector search
  document.getElementById('recipeSelectorSearch')?.addEventListener('input', () => {
    handleSelectorSearch();
  });
  
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMobileMenu = document.getElementById('closeMobileMenu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.add('open');
    });
  }
  
  if (closeMobileMenu && mobileMenu) {
    closeMobileMenu.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  }
  
  // Close mobile menu when clicking on a tab
  document.querySelectorAll('#mobileMenu button[onclick^="showTab"]').forEach(btn => {
    btn.addEventListener('click', () => {
      mobileMenu?.classList.remove('open');
    });
  });
  
  // Close modals on backdrop click
  document.querySelectorAll('.fixed.inset-0').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.fixed.inset-0').forEach(modal => {
        modal.classList.add('hidden');
      });
      mobileMenu?.classList.remove('open');
    }
  });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Expose functions to global scope for HTML event handlers
window.RecipeManager = RecipeManager;
window.MenuManager = MenuManager;
window.ManualMenuManager = ManualMenuManager;
window.TabManager = TabManager;
window.UIHelpers = UIHelpers;

// ============================================
// GLOBAL WRAPPER FUNCTIONS (for HTML onclick)
// ============================================

/**
 * Toggles the visibility of the add recipe form
 * Called by: onclick="toggleRecipeForm()" in index.html
 */
function toggleRecipeForm() {
  const form = document.getElementById('recipeForm');
  const btn = document.getElementById('toggleRecipeFormBtn');
  
  if (form.classList.contains('hidden')) {
    // Show form
    form.classList.remove('hidden');
    btn.innerHTML = '<i class="fas fa-chevron-up mr-2"></i>Ocultar Formulario';
    btn.classList.remove('bg-green-500', 'hover:bg-green-600');
    btn.classList.add('bg-red-500', 'hover:bg-red-600');
  } else {
    // Hide form
    form.classList.add('hidden');
    btn.innerHTML = '<i class="fas fa-chevron-down mr-2"></i>Mostrar Formulario';
    btn.classList.remove('bg-red-500', 'hover:bg-red-600');
    btn.classList.add('bg-green-500', 'hover:bg-green-600');
    // Reset form when hiding
    RecipeManager.resetForm('recipeForm');
  }
}

/**
 * Resets the add recipe form
 * Called by: onclick="resetRecipeForm()" in index.html
 */
function resetRecipeForm() {
  RecipeManager.resetForm('recipeForm');
}

/**
 * Switches between tabs (wrapper for TabManager)
 * Called by: onclick="showTab('recipes')" and onclick="showTab('menus')" in index.html
 * @param {string} tabName - 'recipes' or 'menus'
 */
function showTab(tabName) {
  TabManager.switchTab(tabName);
}

/**
 * Toggles the manual menu form visibility
 * Called by: onclick="toggleManualMenuForm()" in index.html
 */
function toggleManualMenuForm() {
  ManualMenuManager.toggleForm();
}

/**
 * Saves the manual menu
 * Called by: onclick="saveManualMenu()" in index.html
 */
function saveManualMenu() {
  ManualMenuManager.save();
}

/**
 * Clears the manual menu form
 * Called by: onclick="clearManualMenu()" in index.html
 */
function clearManualMenu() {
  ManualMenuManager.clear();
}

/**
 * Generates a weekly menu automatically
 * Called by: onclick="generateMenu()" in index.html
 */
function generateMenu() {
  MenuManager.generateMenu();
}

/**
 * Sets the recipe view mode (grid or list)
 * Called by: onclick="setRecipeView('grid')" and onclick="setRecipeView('list')" in index.html
 * @param {string} view - 'grid' or 'list'
 */
function setRecipeView(view) {
  RecipeManager.setView(view);
}

/**
 * Handles search input in recipe selector modal
 * Routes to appropriate manager based on current mode
 */
function handleSelectorSearch() {
  // Determine which mode is active and route accordingly
  if (ManualMenuManager.manualMenuForm.selectedDay !== null) {
    ManualMenuManager.renderRecipeSelector();
  } else if (MenuManager.substitutionState.menuId !== null) {
    MenuManager.renderSubstitutionSelector();
  }
}

/**
 * Handles view toggle in recipe selector modal
 * @param {string} mode - 'grid' or 'list'
 */
function handleSelectorViewToggle(mode) {
  if (ManualMenuManager.manualMenuForm.selectedDay !== null) {
    ManualMenuManager.toggleSelectorView(mode);
  } else if (MenuManager.substitutionState.menuId !== null) {
    MenuManager.toggleSubstitutionView(mode);
  }
}

/**
 * Closes the recipe selector modal
 */
function closeSelectorModal() {
  if (ManualMenuManager.manualMenuForm.selectedDay !== null) {
    ManualMenuManager.closeRecipeSelector();
  } else {
    document.getElementById('recipeSelectorModal').classList.add('hidden');
    MenuManager.substitutionState = { menuId: null, dayIndex: null, mealType: null, viewMode: 'grid' };
  }
}
