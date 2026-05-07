/**
 * ============================================
 * SELECT COMPONENT
 * ============================================
 * 
 * Reusable select component
 */

export class Select {
  constructor({
    id = '',
    options = [],
    value = '',
    required = false,
    disabled = false,
    className = '',
    onChange = null
  } = {}) {
    this.id = id;
    this.options = options;
    this.value = value;
    this.required = required;
    this.disabled = disabled;
    this.className = className;
    this.onChange = onChange;
  }

  render() {
    const baseClasses = 'w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    const disabledClasses = this.disabled ? 'bg-gray-100 cursor-not-allowed' : '';
    const classes = `${baseClasses} ${disabledClasses} ${this.className}`;

    const optionsHtml = this.options.map(option => `
      <option value="${option.value}" ${option.value === this.value ? 'selected' : ''}>
        ${option.label}
      </option>
    `).join('');

    return `
      <select 
        id="${this.id}"
        ${this.required ? 'required' : ''}
        ${this.disabled ? 'disabled' : ''}
        class="${classes}"
        ${this.onChange ? `onchange="${this.onChange}"` : ''}
      >
        ${optionsHtml}
      </select>
    `;
  }
}
