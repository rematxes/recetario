/**
 * ============================================
 * TEXTAREA COMPONENT
 * ============================================
 * 
 * Reusable textarea component
 */

export class Textarea {
  constructor({
    id = '',
    placeholder = '',
    value = '',
    rows = 4,
    required = false,
    disabled = false,
    className = '',
    onChange = null
  } = {}) {
    this.id = id;
    this.placeholder = placeholder;
    this.value = value;
    this.rows = rows;
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
      <textarea 
        id="${this.id}"
        placeholder="${this.placeholder}"
        rows="${this.rows}"
        ${this.required ? 'required' : ''}
        ${this.disabled ? 'disabled' : ''}
        class="${classes}"
        ${this.onChange ? `onchange="${this.onChange}"` : ''}
      >${this.value}</textarea>
    `;
  }
}
