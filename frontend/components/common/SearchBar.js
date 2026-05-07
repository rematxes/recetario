/**
 * ============================================
 * Search Bar Component
 * ============================================
 * 
 * Reusable search bar with category filters and sorting.
 * Unifies the search functionality between recipe list
 * and recipe selector modals.
 */

import { CATEGORY_CONFIG } from '../../config.js';

export class SearchBar {
  constructor(options = {}) {
    this.containerId = options.containerId || 'searchContainer';
    this.placeholder = options.placeholder || 'Buscar...';
    this.filters = options.filters || ['comida', 'cena', 'general', 'picoteo', 'dulce'];
    this.sortOptions = options.sortOptions || [
      { value: 'date-desc', label: 'Más reciente' },
      { value: 'date-asc', label: 'Más antiguo' },
      { value: 'name-asc', label: 'Nombre (A-Z)' },
      { value: 'name-desc', label: 'Nombre (Z-A)' }
    ];
    this.showFilters = options.showFilters !== false;
    this.showSort = options.showSort !== false;
    this.initialFilters = options.initialFilters || null;
    
    // Callbacks
    this.onSearch = options.onSearch || (() => {});
    this.onFilterChange = options.onFilterChange || (() => {});
    this.onSortChange = options.onSortChange || (() => {});
    
    // State
    this.searchTerm = '';
    this.activeFilters = this.initialFilters || this._getDefaultFilters();
    this.sortOrder = options.defaultSort || 'date-desc';
    this.filterPrefix = options.filterPrefix || 'filter';
    
    this.container = null;
    this.searchInput = null;
    this.sortSelect = null;
    
    this._init();
  }
  
  /**
   * Get default filters (all active)
   */
  _getDefaultFilters() {
    return this.filters.reduce((acc, filter) => {
      acc[filter] = true;
      return acc;
    }, {});
  }
  
  /**
   * Initialize component
   */
  _init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.error(`SearchBar: Container #${this.containerId} not found`);
      return;
    }
    
    this.container.innerHTML = this._getTemplate();
    this._bindEvents();
    this._updateFilterButtons();
  }
  
  /**
   * Get HTML template
   */
  _getTemplate() {
    const searchId = `${this.containerId}-search`;
    const sortId = `${this.containerId}-sort`;
    
    let filtersHtml = '';
    if (this.showFilters) {
      filtersHtml = `
        <div class="search-filters__group">
          ${this.filters.map(filter => `
            <button id="${this.filterPrefix}-${filter}" 
                    class="category-filter-btn category-filter-btn--${filter}"
                    data-category="${filter}"
                    onclick="window.searchBarInstances['${this.containerId}'].toggleFilter('${filter}')">
              <i class="fas ${CATEGORY_CONFIG[filter]?.icon || 'fa-tag'} mr-1"></i>
              ${CATEGORY_CONFIG[filter]?.label || filter}
            </button>
          `).join('')}
        </div>
      `;
    }
    
    let sortHtml = '';
    if (this.showSort) {
      sortHtml = `
        <div class="search-sort">
          <span class="search-sort__label">Ordenar:</span>
          <select id="${sortId}" class="search-sort__select">
            ${this.sortOptions.map(opt => `
              <option value="${opt.value}" ${opt.value === this.sortOrder ? 'selected' : ''}>
                ${opt.label}
              </option>
            `).join('')}
          </select>
        </div>
      `;
    }
    
    return `
      <div class="search-box">
        <input type="text" id="${searchId}"
               placeholder="${this.placeholder}"
               class="search-input"
               value="${this.searchTerm}">
      </div>
      ${this.showFilters || this.showSort ? `
        <div class="search-filters">
          ${filtersHtml}
          ${sortHtml}
        </div>
      ` : ''}
    `;
  }
  
  /**
   * Bind DOM events
   */
  _bindEvents() {
    // Search input
    const searchId = `${this.containerId}-search`;
    this.searchInput = document.getElementById(searchId);
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase().trim();
        this.onSearch(this.searchTerm);
      });
    }
    
    // Sort select
    const sortId = `${this.containerId}-sort`;
    this.sortSelect = document.getElementById(sortId);
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        this.sortOrder = e.target.value;
        this.onSortChange(this.sortOrder);
      });
    }
    
    // Register instance globally for onclick handlers
    if (!window.searchBarInstances) {
      window.searchBarInstances = {};
    }
    window.searchBarInstances[this.containerId] = this;
  }
  
  /**
   * Toggle category filter
   */
  toggleFilter(category) {
    this.activeFilters[category] = !this.activeFilters[category];
    this._updateFilterButtons();
    this.onFilterChange(this.activeFilters);
  }
  
  /**
   * Update filter button visual states
   */
  _updateFilterButtons() {
    Object.keys(this.activeFilters).forEach(category => {
      const btn = document.getElementById(`${this.filterPrefix}-${category}`);
      if (btn) {
        btn.classList.toggle('active', this.activeFilters[category]);
      }
    });
  }
  
  /**
   * Set filters programmatically
   */
  setFilters(filters) {
    this.activeFilters = { ...this.activeFilters, ...filters };
    this._updateFilterButtons();
    this.onFilterChange(this.activeFilters);
  }
  
  /**
   * Get current state
   */
  getState() {
    return {
      searchTerm: this.searchTerm,
      filters: this.activeFilters,
      sortOrder: this.sortOrder
    };
  }
  
  /**
   * Set search term programmatically
   */
  setSearchTerm(term) {
    this.searchTerm = term;
    if (this.searchInput) {
      this.searchInput.value = term;
    }
    this.onSearch(this.searchTerm);
  }
  
  /**
   * Clear all filters
   */
  clearFilters() {
    this.activeFilters = this._getDefaultFilters();
    this._updateFilterButtons();
    this.onFilterChange(this.activeFilters);
  }
  
  /**
   * Reset to initial state
   */
  reset() {
    this.searchTerm = '';
    this.activeFilters = this.initialFilters || this._getDefaultFilters();
    this.sortOrder = this.sortOptions[0]?.value || 'date-desc';
    
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    if (this.sortSelect) {
      this.sortSelect.value = this.sortOrder;
    }
    
    this._updateFilterButtons();
  }
  
  /**
   * Destroy component
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    if (window.searchBarInstances) {
      delete window.searchBarInstances[this.containerId];
    }
  }
}

/**
 * Factory function for quick creation
 */
export function createSearchBar(containerId, options = {}) {
  return new SearchBar({ containerId, ...options });
}
