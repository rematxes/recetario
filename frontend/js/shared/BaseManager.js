import { apiService } from './api/apiService.js';
import { showError } from './utils.js';

/**
 * Base Manager with common functionality for all managers
 */
export class BaseManager {
  constructor(appState) {
    this.appState = appState;
    this.items = [];
    this.containerId = null;
    this.searchInputId = null;
  }

  async loadAll(apiMethod, stateKey) {
    try {
      this.items = await apiMethod.call(apiService);
      this.appState.set(stateKey, this.items);
      this.render();
      return this.items;
    } catch (error) {
      showError(this.getErrorMessage('load'));
      console.error(`Load ${stateKey} error:`, error);
      throw error;
    }
  }

  filterItems(searchTerm, additionalFilters = null) {
    let filtered = [...this.items];
    
    if (additionalFilters) {
      filtered = filtered.filter(additionalFilters);
    }
    
    if (!searchTerm) return filtered;

    const term = searchTerm.toLowerCase().trim();
    const isTimeFilter = !isNaN(parseInt(term));

    return filtered.filter(item => this.matchesSearch(item, term, isTimeFilter));
  }

  matchesSearch(item, term, isTimeFilter) {
    // Override in subclasses
    return item.name?.toLowerCase().includes(term);
  }

  sortItems(items, sortOrder) {
    const sorted = [...items];
    
    switch (sortOrder) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name?.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name?.localeCompare(a.name));
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
      default:
        return sorted;
    }
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const searchTerm = document.getElementById(this.searchInputId)?.value?.toLowerCase().trim() || '';
    const filtered = this.filterItems(searchTerm);
    const sorted = this.sortItems(filtered, this.appState.get(this.sortOrderKey || 'recipeSortOrder'));

    if (sorted.length === 0) {
      this.renderEmpty(container);
    } else {
      this.renderItems(container, sorted);
    }
  }

  renderEmpty(container) {
    container.innerHTML = this.getEmptyTemplate();
  }

  getEmptyTemplate() {
    return '<div class="text-center py-8 text-gray-500">No items found</div>';
  }

  renderItems(container, items) {
    // Override in subclasses
    container.innerHTML = items.map(item => this.renderItem(item)).join('');
  }

  renderItem(item) {
    // Override in subclasses
    return `<div>${item.name}</div>`;
  }

  getErrorMessage(operation) {
    return `Error ${operation}ing items`;
  }

  setView(view) {
    this.appState.set(this.viewKey || 'currentView', view);
    this.render();
  }
}
