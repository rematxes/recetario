/**
 * ============================================
 * BOTTOM NAVIGATION COMPONENT (Instagram-style)
 * ============================================
 * 
 * Fixed bottom navigation with icons and central FAB button
 */

export class BottomNavigation {
  constructor({ items = [], fabButton = null } = {}) {
    this.items = items;
    this.fabButton = fabButton;
  }

  render() {
    const firstItemHtml = this.items[0] ? `
      <button 
        onclick="${this.items[0].onClick}"
        class="flex-1 flex flex-col items-center justify-center py-3 ${this.items[0].active ? 'text-blue-600 font-bold scale-110' : 'text-gray-500'} hover:text-blue-500 transition-all duration-200"
      >
        <i class="${this.items[0].icon} ${this.items[0].active ? 'text-2xl' : 'text-xl'} mb-1"></i>
        <span class="text-xs ${this.items[0].active ? 'font-semibold' : ''}">${this.items[0].label}</span>
      </button>
    ` : '';

    const secondItemHtml = this.items[1] ? `
      <button 
        onclick="${this.items[1].onClick}"
        class="flex-1 flex flex-col items-center justify-center py-3 ${this.items[1].active ? 'text-blue-600 font-bold scale-110' : 'text-gray-500'} hover:text-blue-500 transition-all duration-200"
      >
        <i class="${this.items[1].icon} ${this.items[1].active ? 'text-2xl' : 'text-xl'} mb-1"></i>
        <span class="text-xs ${this.items[1].active ? 'font-semibold' : ''}">${this.items[1].label}</span>
      </button>
    ` : '';

    const fabHtml = this.fabButton ? `
      <div class="flex-1 flex items-center justify-center relative">
        <button 
          onclick="${this.fabButton.onClick}"
          class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-110 active:scale-95"
          style="margin-top: -24px; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.5); border: 4px solid white;"
        >
          <i class="${this.fabButton.icon} text-3xl"></i>
        </button>
      </div>
    ` : '';

    return `
      <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
        <div class="flex items-center justify-around h-16">
          ${firstItemHtml}
          ${fabHtml}
          ${secondItemHtml}
        </div>
      </nav>
    `;
  }
}

export const createBottomNavigation = (items, fabButton) => new BottomNavigation({ items, fabButton });
