/**
 * ============================================
 * BOTTOM NAVIGATION COMPONENT (Instagram-style)
 * ============================================
 * 
 * Fixed bottom navigation with icons
 */

export class BottomNavigation {
  constructor({ items = [] } = {}) {
    this.items = items;
  }

  render() {
    const itemsHtml = this.items.map(item => `
      <button 
        onclick="${item.onClick}"
        class="flex-1 flex flex-col items-center justify-center py-2 ${item.active ? 'text-blue-600' : 'text-gray-600'} hover:text-blue-500 transition-colors"
      >
        <i class="${item.icon} text-xl mb-1"></i>
        <span class="text-xs">${item.label}</span>
      </button>
    `).join('');

    return `
      <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-40">
        <div class="flex items-center justify-around">
          ${itemsHtml}
        </div>
      </nav>
    `;
  }
}

export const createBottomNavigation = (items) => new BottomNavigation({ items });
