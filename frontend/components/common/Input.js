/**
 * ============================================
 * INPUT COMPONENT
 * ============================================
 * 
 * Reusable input component
 */

export class Input {
  constructor({
    id = '',
    type = 'text',
    placeholder = '',
    value = '',
    required = false,
    disabled = false,
    className = '',
    onChange = null
  } = {}) {
    this.id = id;
    this.type = type;
    this.placeholder = placeholder;
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

    return `
      <input 
        type="${this.type}"
        id="${this.id}"
        placeholder="${this.placeholder}"
        value="${this.value}"
        ${this.required ? 'required' : ''}
        ${this.disabled ? 'disabled' : ''}
        class="${classes}"
        ${this.onChange ? `onchange="${this.onChange}"` : ''}
      />
    `;
  }
}
