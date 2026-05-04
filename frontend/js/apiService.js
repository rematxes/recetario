/**
 * ============================================
 * API SERVICE CLASS
 * ============================================
 */

import { CONFIG } from './config.js';

export class ApiService {
  constructor() {
    this.baseUrl = CONFIG.API_BASE;
  }

  /**
   * Makes a fetch request with error handling
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle 204 No Content responses (DELETE operations)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
      }

      return response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Recipe CRUD Operations
  async getAllRecipes() {
    return this.request('/api/recipes');
  }

  async getRecipe(id) {
    return this.request(`/api/recipes/${id}`);
  }

  async createRecipe(data) {
    return this.request('/api/recipes', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateRecipe(id, data) {
    return this.request(`/api/recipes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteRecipe(id) {
    return this.request(`/api/recipes/${id}`, { method: 'DELETE' });
  }

  // Menu CRUD Operations
  async getAllMenus() {
    return this.request('/api/menus');
  }

  async generateMenu(weekStart) {
    return this.request('/api/menus/generate', {
      method: 'POST',
      body: JSON.stringify({ weekStart })
    });
  }

  async createMenu(data) {
    return this.request('/api/menus', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateMenu(id, data) {
    return this.request(`/api/menus/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteMenu(id) {
    return this.request(`/api/menus/${id}`, { method: 'DELETE' });
  }
}

// Singleton instance
export const apiService = new ApiService();
