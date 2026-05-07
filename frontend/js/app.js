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
import { appState } from './core/AppState.js';
import { router } from './core/Router.js';
import { RecipeManager } from './features/recipes/RecipeManager.js';
import { MenuManager } from './menuManager.js';
import { ManualMenuManager } from './manualMenuManager.js';
import { UnifiedModal, ModalManager } from './shared/components/UnifiedModal.js';
import { SearchBar, createSearchBar } from './shared/components/SearchBar.js';
import { createBottomNavigation } from '../components/layout/BottomNavigation.js';
import { RecetarioPage } from '../pages/RecetarioPage.js';
import { MenusPage } from '../pages/MenusPage.js';

console.log('[APP] Module loaded, initializing...');

// ============================================
// INITIALIZE MANAGERS
// ============================================

const recipeManager = new RecipeManager(appState);
const menuManager = new MenuManager(appState, recipeManager);
const manualMenuManager = new ManualMenuManager(appState, recipeManager);

// Initialize pages
const recetarioPage = new RecetarioPage(appState, recipeManager);
const menusPage = new MenusPage(appState, recipeManager, menuManager, manualMenuManager);

console.log('[APP] Managers initialized');

// ============================================
// GLOBAL WRAPPER FUNCTIONS
// ============================================

function handleFabClick() {
  const currentHash = window.location.hash.slice(1) || 'recetario';
  if (currentHash === 'recetario') {
    openCreateRecipeModal();
  } else if (currentHash === 'menus') {
    openCreateMenuModal();
  }
}

function closeCreateMenuModal() {
  const modal = document.getElementById('createMenuModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
}

function openCreateMenuModal() {
  const modal = document.getElementById('createMenuModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    // Set default date to next Monday
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
    const dateInput = document.getElementById('randomMenuWeekStart');
    if (dateInput) {
      dateInput.valueAsDate = nextMonday;
    }
  }
}

function generateRandomMenu() {
  const dateInput = document.getElementById('randomMenuWeekStart');
  if (dateInput && dateInput.value) {
    // Set the date in the main menuWeekStart input and call generateMenu
    const mainDateInput = document.getElementById('menuWeekStart');
    if (mainDateInput) {
      mainDateInput.value = dateInput.value;
    }
    closeCreateMenuModal();
    generateMenu();
  }
}

function createManualMenu() {
  closeCreateMenuModal();
  toggleManualMenuForm();
}

function closeCreateRecipeModal() {
  const modal = document.getElementById('createRecipeModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
}

function openCreateRecipeModal() {
  const modal = document.getElementById('createRecipeModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    // Reset form
    document.getElementById('createRecipeForm').reset();
    document.getElementById('createRecipeId').value = '';
  }
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
  if (appState.get('manualMenuForm').selectedDay !== null) {
    manualMenuManager.renderRecipeSelector();
  } else if (menuManager.substitutionState.menuId !== null) {
    menuManager.renderSubstitutionSelector();
  }
}

function handleSelectorViewToggle(mode) {
  if (appState.get('manualMenuForm').selectedDay !== null) {
    manualMenuManager.toggleSelectorView(mode);
  } else if (menuManager.substitutionState.menuId !== null) {
    menuManager.toggleSubstitutionView(mode);
  }
}

function handleRecipeSortChange() {
  const sortOrder = document.getElementById('recipeSortOrder')?.value || 'name-asc';
  appState.set('recipeSortOrder', sortOrder);
  recipeManager.render();
}

function toggleCategoryFilter(category) {
  const filters = { ...appState.get('categoryFilters') };
  filters[category] = !filters[category];
  appState.set('categoryFilters', filters);

  const btn = document.getElementById(`filter-${category}`);
  if (btn) {
    btn.classList.toggle('active', filters[category]);
  }

  recipeManager.render();
}

function toggleSelectorCategoryFilter(category) {
  const filters = { ...(appState.get('selectorCategoryFilters') || {
    comida: true,
    cena: true,
    general: true,
    picoteo: true,
    dulce: true
  }) };
  filters[category] = !filters[category];
  appState.set('selectorCategoryFilters', filters);

  const btn = document.getElementById(`selector-filter-${category}`);
  if (btn) {
    btn.classList.toggle('active', filters[category]);
  }

  if (appState.get('manualMenuForm').selectedDay !== null) {
    manualMenuManager.renderRecipeSelector();
  } else if (menuManager.substitutionState.menuId !== null) {
    menuManager.renderSubstitutionSelector();
  }
}

function handleSelectorSortChange() {
  const sortOrder = document.getElementById('selectorSortOrder')?.value || 'name-asc';
  appState.set('selectorSortOrder', sortOrder);
  if (appState.get('manualMenuForm').selectedDay !== null) {
    manualMenuManager.renderRecipeSelector();
  } else if (menuManager.substitutionState.menuId !== null) {
    menuManager.renderSubstitutionSelector();
  }
}

function closeSelectorModal() {
  if (appState.get('manualMenuForm').selectedDay !== null) {
    manualMenuManager.closeRecipeSelector();
  } else {
    document.getElementById('recipeSelectorModal').classList.remove('active');
  }
}

// Expose global functions
window.handleFabClick = handleFabClick;
window.openCreateRecipeModal = openCreateRecipeModal;
window.closeCreateRecipeModal = closeCreateRecipeModal;
window.openCreateMenuModal = openCreateMenuModal;
window.closeCreateMenuModal = closeCreateMenuModal;
window.generateRandomMenu = generateRandomMenu;
window.createManualMenu = createManualMenu;
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
window.toggleSelectorCategoryFilter = toggleSelectorCategoryFilter;
window.closeSelectorModal = closeSelectorModal;

// Expose managers
window.recipeManager = recipeManager;
window.menuManager = menuManager;
window.manualMenuManager = manualMenuManager;

// Expose router
window.router = router;

// Expose UI components for global access
window.UnifiedModal = UnifiedModal;
window.ModalManager = ModalManager;
window.SearchBar = SearchBar;
window.createSearchBar = createSearchBar;

console.log('[APP] Global functions and managers exposed to window');

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  document.getElementById('createRecipeForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    recipeManager.saveRecipe(e, 'createRecipeForm');
    closeCreateRecipeModal();
  });

  document.getElementById('editRecipeForm')?.addEventListener('submit', (e) => {
    recipeManager.saveRecipe(e);
  });

  document.getElementById('recipeSearch')?.addEventListener('input', () => {
    recipeManager.render();
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

function updateBottomNavigation(activeRoute) {
  const bottomNavContainer = document.getElementById('bottomNavigation');
  if (bottomNavContainer) {
    const bottomNav = createBottomNavigation(
      [
        {
          icon: 'fas fa-book',
          label: 'Recetas',
          active: activeRoute === 'recetario',
          onClick: "window.router.navigate('recetario')"
        },
        {
          icon: 'fas fa-calendar-week',
          label: 'Menús',
          active: activeRoute === 'menus',
          onClick: "window.router.navigate('menus')"
        }
      ],
      {
        icon: 'fas fa-plus',
        onClick: "window.handleFabClick()"
      }
    );
    bottomNavContainer.innerHTML = bottomNav.render();
  }
}

function initApp() {
  setupEventListeners();

  // Show main app directly (no authentication)
  document.getElementById('mainApp').classList.remove('hidden');
  
  // Setup routing
  router.register('recetario', () => {
    const recipesTab = document.getElementById('recipes-tab');
    const menusTab = document.getElementById('menus-tab');
    if (recipesTab) recipesTab.classList.remove('hidden');
    if (menusTab) menusTab.classList.add('hidden');
    recetarioPage.init();
    updateBottomNavigation('recetario');
  });
  
  router.register('menus', () => {
    const recipesTab = document.getElementById('recipes-tab');
    const menusTab = document.getElementById('menus-tab');
    if (recipesTab) recipesTab.classList.add('hidden');
    if (menusTab) menusTab.classList.remove('hidden');
    menusPage.init();
    updateBottomNavigation('menus');
  });
  
  router.start();
  
  // Initialize default page (recetario) if no hash is set
  if (!window.location.hash) {
    router.navigate('recetario');
  }
  
  // Initialize BottomNavigation
  const bottomNavContainer = document.getElementById('bottomNavigation');
  if (bottomNavContainer) {
    const bottomNav = createBottomNavigation(
      [
        {
          icon: 'fas fa-book',
          label: 'Recetas',
          active: true,
          onClick: "window.router.navigate('recetario')"
        },
        {
          icon: 'fas fa-calendar-week',
          label: 'Menús',
          active: false,
          onClick: "window.router.navigate('menus')"
        }
      ],
      {
        icon: 'fas fa-plus',
        onClick: "window.handleFabClick()"
      }
    );
    bottomNavContainer.innerHTML = bottomNav.render();
  }
  
  // Initialize tabs - show recipes by default
  const recipesTab = document.getElementById('recipes-tab');
  const menusTab = document.getElementById('menus-tab');
  if (recipesTab) recipesTab.classList.remove('hidden');
  if (menusTab) menusTab.classList.add('hidden');
  
  // Initialize recetario page
  recetarioPage.init();

  // Initialize category filter buttons
  const categoryFilters = appState.get('categoryFilters');
  Object.keys(categoryFilters).forEach(category => {
    const btn = document.getElementById(`filter-${category}`);
    if (btn) {
      btn.classList.toggle('active', categoryFilters[category]);
    }
  });

  // Initialize selector category filter buttons
  const selectorFilters = appState.get('selectorCategoryFilters') || {
    comida: true,
    cena: true,
    general: true,
    picoteo: true,
    dulce: true
  };
  appState.set('selectorCategoryFilters', selectorFilters);
  Object.keys(selectorFilters).forEach(category => {
    const btn = document.getElementById(`selector-filter-${category}`);
    if (btn) {
      btn.classList.toggle('active', selectorFilters[category]);
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
