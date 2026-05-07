/**
 * ============================================
 * BUTTON COMPONENT
 * ============================================
 * 
 * Reusable button component with variants
 */

export class Button {
  constructor({
    text = '',
    icon = null,
    variant = 'primary', // primary, secondary, danger, success
    size = 'medium', // small, medium, large
    disabled = false,
    onClick = null,
    className = ''
  } = {}) {
    this.text = text;
    this.icon = icon;
    this.variant = variant;
    this.size = size;
    this.disabled = disabled;
    this.onClick = onClick;
    this.className = className;
  }

  getVariantClasses() {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
    };
    return variants[this.variant] || variants.primary;
  }

  getSizeClasses() {
    const sizes = {
      small: 'px-3 py-1 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-6 py-3 text-lg'
    };
    return sizes[this.size] || sizes.medium;
  }

  render() {
    const baseClasses = 'rounded-lg font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
    const disabledClasses = this.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    const classes = `${baseClasses} ${this.getVariantClasses()} ${this.getSizeClasses()} ${disabledClasses} ${this.className}`;

    const iconHtml = this.icon ? `<i class="${this.icon} mr-2"></i>` : '';

    return `
      <button class="${classes}" ${this.disabled ? 'disabled' : ''} ${this.onClick ? `onclick="${this.onClick}"` : ''}>
        ${iconHtml}${this.text}
      </button>
    `;
  }
}
