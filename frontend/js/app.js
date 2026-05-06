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
import { RecipeManager } from './features/recipes/RecipeManager.js';
import { AuthManager } from './features/auth/AuthManager.js';
import { MenuManager } from './menuManager.js';
import { ManualMenuManager } from './manualMenuManager.js';
import { TabManager } from './tabManager.js';
import { UnifiedModal, ModalManager } from './shared/components/UnifiedModal.js';
import { SearchBar, createSearchBar } from './shared/components/SearchBar.js';

console.log('[APP] Module loaded, initializing...');

// ============================================
// INITIALIZE MANAGERS
// ============================================

const authManager = new AuthManager(appState);
const recipeManager = new RecipeManager(appState);
const menuManager = new MenuManager(appState, recipeManager);
const manualMenuManager = new ManualMenuManager(appState, recipeManager);
const tabManager = new TabManager(recipeManager, menuManager);

console.log('[APP] Managers initialized');

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

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    showError('Usuario y contraseña son requeridos');
    return;
  }

  authManager.login(username, password).then(success => {
    if (success) {
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('mainApp').classList.remove('hidden');
    }
  });
}

function handleLogout() {
  authManager.logout();
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
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
window.toggleSelectorCategoryFilter = toggleSelectorCategoryFilter;
window.closeSelectorModal = closeSelectorModal;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;

// Expose managers
window.authManager = authManager;
window.recipeManager = recipeManager;
window.menuManager = menuManager;
window.manualMenuManager = manualMenuManager;
window.tabManager = tabManager;

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
  // Login form
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

  document.getElementById('recipeForm')?.addEventListener('submit', (e) => {
    recipeManager.saveRecipe(e);
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

function initApp() {
  setupEventListeners();

  // Check authentication on startup
  const isAuthenticated = authManager.checkAuth();

  if (isAuthenticated) {
    // User is authenticated, show main app
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    const recipesTab = document.getElementById('recipes-tab');
    const menusTab = document.getElementById('menus-tab');
    if (recipesTab) recipesTab.classList.add('active');
    if (menusTab) menusTab.classList.remove('active');

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
  } else {
    // User is not authenticated, show login screen
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    console.log('Authentication required. Please log in.');
  }
}

// Start the application
document.addEventListener('DOMContentLoaded', initApp);
