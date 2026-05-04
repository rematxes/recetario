/**
 * ============================================
 * RECIPE & MENU MANAGER - MAIN APPLICATION
 * ============================================
 * 
 * Entry point that initializes all classes and sets up event listeners.
 * Uses ES6 modules and classes for better maintainability.
 * 
 * @version 3.0.0
 */

import { CONFIG } from './config.js';
import { showSuccess, showError } from './utils.js';
import { RecipeManager } from './recipeManager.js';
import { MenuManager } from './menuManager.js';
import { ManualMenuManager } from './manualMenuManager.js';
import { TabManager } from './tabManager.js';

// ============================================
// APPLICATION STATE
// ============================================

const AppState = {
  recipes: [],
  menus: [],
  currentView: CONFIG.VIEWS.GRID,
  recipeSortOrder: 'date-desc', // name-asc, name-desc, date-desc, date-asc
  selectorSortOrder: 'date-desc',
  categoryFilters: {
    desayuno: true,
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
    selectorViewMode: CONFIG.VIEWS.GRID,
    data: {}
  },
  editingRecipeId: null
};

// ============================================
// INITIALIZE MANAGERS
// ============================================

const recipeManager = new RecipeManager(AppState);
const menuManager = new MenuManager(AppState, recipeManager);
const manualMenuManager = new ManualMenuManager(AppState, recipeManager);
const tabManager = new TabManager(recipeManager, menuManager);

// Expose to window for HTML event handlers
window.recipeManager = recipeManager;
window.menuManager = menuManager;
window.manualMenuManager = manualMenuManager;
window.tabManager = tabManager;

// ============================================
// GLOBAL WRAPPER FUNCTIONS
// ============================================

function toggleRecipeForm() {
  const form = document.getElementById('recipeForm');
  const chevron = document.getElementById('recipeFormChevron');

  if (form.classList.contains('hidden')) {
    form.classList.remove('hidden');
    if (chevron) {
      chevron.classList.remove('fa-chevron-down');
      chevron.classList.add('fa-chevron-up');
    }
  } else {
    form.classList.add('hidden');
    if (chevron) {
      chevron.classList.remove('fa-chevron-up');
      chevron.classList.add('fa-chevron-down');
    }
    recipeManager.resetForm('recipeForm');
  }
}

function resetRecipeForm() {
  recipeManager.resetForm('recipeForm');
}

function showTab(tabName) {
  tabManager.switchTab(tabName);
}

function toggleManualMenuForm() {
  manualMenuManager.toggleForm();
}

function saveManualMenu() {
  manualMenuManager.save();
}

function clearManualMenu() {
  manualMenuManager.clear();
}

function generateMenu() {
  menuManager.generateMenu();
}

function setRecipeView(view) {
  recipeManager.setView(view);
}

function handleSelectorSearch() {
  if (AppState.manualMenuForm.selectedDay !== null) {
    manualMenuManager.renderRecipeSelector();
  } else if (menuManager.substitutionState.menuId !== null) {
    menuManager.renderSubstitutionSelector();
  }
}

function handleSelectorViewToggle(mode) {
  if (AppState.manualMenuForm.selectedDay !== null) {
    manualMenuManager.toggleSelectorView(mode);
  } else if (menuManager.substitutionState.menuId !== null) {
    menuManager.toggleSubstitutionView(mode);
  }
}

function handleRecipeSortChange() {
  const sortOrder = document.getElementById('recipeSortOrder')?.value || 'name-asc';
  AppState.recipeSortOrder = sortOrder;
  recipeManager.renderRecipes();
}

function toggleCategoryFilter(category) {
  AppState.categoryFilters[category] = !AppState.categoryFilters[category];

  const btn = document.getElementById(`filter-${category}`);
  if (btn) {
    btn.classList.toggle('active', AppState.categoryFilters[category]);
  }

  recipeManager.renderRecipes();
}

function handleSelectorSortChange() {
  const sortOrder = document.getElementById('selectorSortOrder')?.value || 'name-asc';
  AppState.selectorSortOrder = sortOrder;
  if (AppState.manualMenuForm.selectedDay !== null) {
    manualMenuManager.renderRecipeSelector();
  } else if (menuManager.substitutionState.menuId !== null) {
    menuManager.renderSubstitutionSelector();
  }
}

function closeSelectorModal() {
  if (AppState.manualMenuForm.selectedDay !== null) {
    manualMenuManager.closeRecipeSelector();
  } else {
    document.getElementById('recipeSelectorModal').classList.add('hidden');
    menuManager.substitutionState = { menuId: null, dayIndex: null, mealType: null, viewMode: 'grid' };
  }
}

// Expose global functions
window.toggleRecipeForm = toggleRecipeForm;
window.resetRecipeForm = resetRecipeForm;
window.showTab = showTab;
window.toggleManualMenuForm = toggleManualMenuForm;
window.saveManualMenu = saveManualMenu;
window.clearManualMenu = clearManualMenu;
window.generateMenu = generateMenu;
window.setRecipeView = setRecipeView;
window.handleSelectorSearch = handleSelectorSearch;
window.handleSelectorViewToggle = handleSelectorViewToggle;
window.handleRecipeSortChange = handleRecipeSortChange;
window.handleSelectorSortChange = handleSelectorSortChange;
window.toggleCategoryFilter = toggleCategoryFilter;
window.closeSelectorModal = closeSelectorModal;

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  document.getElementById('recipeForm')?.addEventListener('submit', (e) => {
    recipeManager.saveRecipe(e);
  });

  document.getElementById('editRecipeForm')?.addEventListener('submit', (e) => {
    recipeManager.saveRecipe(e);
  });

  document.getElementById('recipeSearch')?.addEventListener('input', () => {
    recipeManager.renderRecipes();
  });

  document.getElementById('recipeSelectorSearch')?.addEventListener('input', () => {
    handleSelectorSearch();
  });

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

  document.querySelectorAll('#mobileMenu button[onclick^="showTab"]').forEach(btn => {
    btn.addEventListener('click', () => {
      mobileMenu?.classList.remove('open');
    });
  });

  document.querySelectorAll('.fixed.inset-0').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.fixed.inset-0').forEach(modal => {
        modal.classList.add('hidden');
      });
      mobileMenu?.classList.remove('open');
    }
  });
}

// ============================================
// INITIALIZATION
// ============================================

function initApp() {
  setupEventListeners();

  const recipesTab = document.getElementById('recipes-tab');
  const menusTab = document.getElementById('menus-tab');
  if (recipesTab) recipesTab.classList.add('active');
  if (menusTab) menusTab.classList.remove('active');

  // Initialize category filter buttons
  Object.keys(AppState.categoryFilters).forEach(category => {
    const btn = document.getElementById(`filter-${category}`);
    if (btn) {
      btn.classList.toggle('active', AppState.categoryFilters[category]);
    }
  });

  recipeManager.loadRecipes();

  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);

  const menuDateInput = document.getElementById('menuWeekStart');
  if (menuDateInput) {
    menuDateInput.valueAsDate = nextMonday;
  }

  console.log('API Base URL:', CONFIG.API_BASE);
  console.log('Recipe & Menu Manager v3.0.0 initialized successfully');
}

// Start the application
document.addEventListener('DOMContentLoaded', initApp);
