import { apiService } from '../../apiService.js';
import { showSuccess, showError } from '../../utils.js';

export class AuthManager {
  constructor(appState) {
    this.appState = appState;
    this.token = null;
    this.username = null;
  }

  async login(username, password) {
    try {
      const response = await apiService.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (response.token) {
        this.token = response.token;
        this.username = response.username;
        
        // Store token in localStorage
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('authUsername', this.username);
        
        // Update app state
        this.appState.set('isAuthenticated', true);
        this.appState.set('authUsername', this.username);
        
        showSuccess(`Bienvenido/a, ${this.username}`);
        return true;
      }
      
      return false;
    } catch (error) {
      showError('Error de autenticación: ' + (error.message || 'Usuario o contraseña incorrectos'));
      return false;
    }
  }

  logout() {
    this.token = null;
    this.username = null;
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsername');
    
    // Update app state
    this.appState.set('isAuthenticated', false);
    this.appState.set('authUsername', null);
    
    showSuccess('Sesión cerrada correctamente');
  }

  checkAuth() {
    // Check if token exists in localStorage
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('authUsername');
    
    if (token && username) {
      this.token = token;
      this.username = username;
      this.appState.set('isAuthenticated', true);
      this.appState.set('authUsername', username);
      return true;
    }
    
    this.appState.set('isAuthenticated', false);
    this.appState.set('authUsername', null);
    return false;
  }

  getToken() {
    return this.token || localStorage.getItem('authToken');
  }

  getUsername() {
    return this.username || localStorage.getItem('authUsername');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}
