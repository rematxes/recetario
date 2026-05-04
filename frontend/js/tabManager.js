/**
 * ============================================
 * TAB MANAGER CLASS
 * ============================================
 */

export class TabManager {
  constructor(recipeManager, menuManager) {
    this.recipeManager = recipeManager;
    this.menuManager = menuManager;
  }

  /**
   * Switches between tabs
   * @param {string} tabName - 'recipes' or 'menus'
   */
  switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });

    const tabId = tabName === 'recipes' ? 'recipes-tab' : 'menus-tab';
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }

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

    if (tabName === 'recipes') {
      this.recipeManager.loadRecipes();
    } else if (tabName === 'menus') {
      this.menuManager.loadMenus();
    }
  }
}
