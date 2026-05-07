/**
 * ============================================
 * SIMPLE HASH ROUTER
 * ============================================
 * 
 * Simple router based on URL hash for SPA navigation
 */

export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.handleHashChange = this.handleHashChange.bind(this);
  }

  /**
   * Registers a route with its corresponding page component
   * @param {string} path - Route path (e.g., 'recetario', 'menus')
   * @param {Function} component - Page component function
   */
  register(path, component) {
    this.routes.set(path, component);
  }

  /**
   * Navigates to a specific route
   * @param {string} path - Route path
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * Handles hash change events
   */
  handleHashChange() {
    const hash = window.location.hash.slice(1) || 'recetario';
    const component = this.routes.get(hash);
    
    if (component && this.currentRoute !== hash) {
      this.currentRoute = hash;
      component();
    }
  }

  /**
   * Starts the router
   */
  start() {
    window.addEventListener('hashchange', this.handleHashChange);
    this.handleHashChange(); // Handle initial hash
  }

  /**
   * Stops the router
   */
  stop() {
    window.removeEventListener('hashchange', this.handleHashChange);
  }
}

export const router = new Router();
