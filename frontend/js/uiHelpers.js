/**
 * ============================================
 * UI HELPERS CLASS
 * ============================================
 */

import { CATEGORY_CONFIG, TIME_ICONS } from './config.js';
import { escapeHtml } from './utils.js';

export class UIHelpers {
  /**
   * Generates HTML for a category badge
   * @param {string} category - Category key
   * @returns {string} HTML string
   */
  static getCategoryBadge(category) {
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
  }

  /**
   * Generates HTML for time badges
   * @param {Object} recipe - Recipe object with time data
   * @returns {string} HTML string
   */
  static getTimeBadges(recipe) {
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
  }

  /**
   * Creates a button element with consistent styling
   * @param {Object} config - Button configuration
   * @returns {string} HTML string
   */
  static createButton({ icon, label, color, onClick, size = 'sm' }) {
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
}
