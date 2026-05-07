/**
 * ============================================
 * Unified Modal Component
 * ============================================
 * 
 * Generic, reusable modal component for consistent
 * modal behavior and styling across the application.
 * 
 * Replaces: recipeModal, editRecipeModal, recipeSelectorModal
 */

export class UnifiedModal {
  constructor(options = {}) {
    this.id = options.id || 'unifiedModal';
    this.title = options.title || '';
    this.icon = options.icon || '';
    this.size = options.size || 'md'; // sm, md, lg, xl
    this.onClose = options.onClose || null;
    this.closeOnOverlay = options.closeOnOverlay !== false;
    this.closeOnEscape = options.closeOnEscape !== false;
    
    this.element = null;
    this.contentElement = null;
    this.isOpen = false;
    
    this._init();
  }
  
  /**
   * Initialize modal structure in DOM
   */
  _init() {
    // Check if modal already exists
    let modal = document.getElementById(this.id);
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = this.id;
      modal.className = 'modal-overlay';
      modal.innerHTML = this._getTemplate();
      document.body.appendChild(modal);
      
      // Bind close button
      const closeBtn = modal.querySelector('.modal-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }
      
      // Bind overlay click
      if (this.closeOnOverlay) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.close();
          }
        });
      }
    }
    
    this.element = modal;
    this.contentElement = modal.querySelector('.modal-body');
    this._bindEscapeKey();
  }
  
  /**
   * Get modal HTML template
   */
  _getTemplate() {
    const sizeClass = `modal-container--${this.size}`;
    
    return `
      <div class="modal-container ${sizeClass}">
        <div class="p-6">
          <div class="modal-header">
            <h3 class="modal-title">
              ${this.icon ? `<i class="fas ${this.icon}"></i>` : ''}
              <span id="${this.id}-title">${this.title}</span>
            </h3>
            <button class="modal-close-btn" aria-label="Cerrar">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          <div class="modal-body" id="${this.id}-content">
            <!-- Dynamic content goes here -->
          </div>
          <div class="modal-footer" id="${this.id}-footer" style="display: none;">
            <!-- Dynamic footer buttons go here -->
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Bind escape key to close modal
   */
  _bindEscapeKey() {
    if (this.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }
  }
  
  /**
   * Open the modal
   */
  open() {
    if (!this.element) return;
    
    this.element.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    this.isOpen = true;
    
    // Trigger open callback if provided
    if (this.onOpen) {
      this.onOpen();
    }
  }
  
  /**
   * Close the modal
   */
  close() {
    if (!this.element) return;
    
    this.element.classList.add('hidden');
    document.body.style.overflow = '';
    this.isOpen = false;
    
    if (this.onClose) {
      this.onClose();
    }
  }
  
  /**
   * Set modal title
   */
  setTitle(title, icon = null) {
    const titleEl = document.getElementById(`${this.id}-title`);
    if (titleEl) {
      titleEl.textContent = title;
    }
    
    if (icon) {
      const iconEl = this.element.querySelector('.modal-title i');
      if (iconEl) {
        iconEl.className = `fas ${icon}`;
      }
    }
  }
  
  /**
   * Set modal content (HTML string or DOM element)
   */
  setContent(content) {
    if (!this.contentElement) return;
    
    if (typeof content === 'string') {
      this.contentElement.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.contentElement.innerHTML = '';
      this.contentElement.appendChild(content);
    }
  }
  
  /**
   * Set footer content (buttons)
   */
  setFooter(buttonsHtml) {
    const footer = document.getElementById(`${this.id}-footer`);
    if (footer) {
      if (buttonsHtml) {
        footer.innerHTML = buttonsHtml;
        footer.style.display = 'flex';
      } else {
        footer.style.display = 'none';
      }
    }
  }
  
  /**
   * Update modal size dynamically
   */
  setSize(size) {
    const container = this.element.querySelector('.modal-container');
    if (container) {
      // Remove old size classes
      ['modal-container--sm', 'modal-container--md', 'modal-container--lg', 'modal-container--xl']
        .forEach(cls => container.classList.remove(cls));
      // Add new size class
      container.classList.add(`modal-container--${size}`);
    }
  }
  
  /**
   * Destroy the modal (remove from DOM)
   */
  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
      this.contentElement = null;
    }
  }
}

/**
 * Modal Manager - Singleton for managing multiple modals
 */
export class ModalManager {
  constructor() {
    this.modals = new Map();
  }
  
  /**
   * Create or get a modal
   */
  get(id, options = {}) {
    if (!this.modals.has(id)) {
      const modal = new UnifiedModal({ id, ...options });
      this.modals.set(id, modal);
    }
    return this.modals.get(id);
  }
  
  /**
   * Close all open modals
   */
  closeAll() {
    this.modals.forEach(modal => {
      if (modal.isOpen) {
        modal.close();
      }
    });
  }
  
  /**
   * Remove a modal
   */
  remove(id) {
    const modal = this.modals.get(id);
    if (modal) {
      modal.destroy();
      this.modals.delete(id);
    }
  }
}

// Export singleton instance
export const modalManager = new ModalManager();
