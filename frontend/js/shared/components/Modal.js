/**
 * Reusable Modal Component
 */
export class Modal {
  constructor(elementId, options = {}) {
    this.element = document.getElementById(elementId);
    this.options = {
      closeOnEscape: true,
      closeOnOverlay: true,
      onClose: null,
      ...options
    };
    this.isOpen = false;
    
    this._setupListeners();
  }

  _setupListeners() {
    if (!this.element) return;

    // Close button
    const closeBtn = this.element.querySelector('[data-modal-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Close on overlay click
    if (this.options.closeOnOverlay) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.close();
        }
      });
    }

    // Close on Escape
    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }
  }

  open() {
    if (!this.element) return;
    this.element.classList.remove('hidden');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.element) return;
    this.element.classList.add('hidden');
    this.isOpen = false;
    document.body.style.overflow = '';
    
    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  setContent(content) {
    const contentContainer = this.element?.querySelector('[data-modal-content]');
    if (contentContainer) {
      contentContainer.innerHTML = content;
    }
  }

  setTitle(title) {
    const titleElement = this.element?.querySelector('[data-modal-title]');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }
}
