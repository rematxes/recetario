/**
 * ============================================
 * UNIFIED RECIPE FORM COMPONENT
 * ============================================
 * 
 * Unified recipe form component for both create and edit modes
 */

export class RecipeForm {
  constructor({
    formId = 'recipeForm',
    mode = 'create', // create or edit
    onSubmit = null,
    onCancel = null,
    initialData = null
  } = {}) {
    this.formId = formId;
    this.mode = mode;
    this.onSubmit = onSubmit;
    this.onCancel = onCancel;
    this.initialData = initialData;
  }

  render() {
    const isEdit = this.mode === 'edit';
    const data = this.initialData || {};
    
    return `
      <form id="${this.formId}" class="space-y-4">
        <input type="hidden" id="${this.formId}Id" value="${data.id || ''}">
        
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">
              <i class="fas fa-tag text-blue-500 mr-1"></i>Nombre *
            </label>
            <input type="text" id="${this.formId}Name" required 
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value="${data.name || ''}"
              placeholder="Nombre de la receta">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">
              <i class="fas fa-folder text-purple-500 mr-1"></i>Categoría
            </label>
            <select id="${this.formId}Category"
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="general" ${data.category === 'general' ? 'selected' : ''}>📂 General</option>
              <option value="comida" ${data.category === 'comida' ? 'selected' : ''}>☀️ Comida</option>
              <option value="cena" ${data.category === 'cena' ? 'selected' : ''}>🌙 Cena</option>
              <option value="picoteo" ${data.category === 'picoteo' ? 'selected' : ''}>🍿 Picoteo</option>
              <option value="dulce" ${data.category === 'dulce' ? 'selected' : ''}>🍭 Dulce</option>
            </select>
          </div>
        </div>
        
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">
              <i class="fas fa-clock text-blue-400 mr-1"></i>Tiempo de preparación (min)
            </label>
            <input type="number" id="${this.formId}PrepTime" min="0" 
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value="${data.prepTime || 0}"
              placeholder="0">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">
              <i class="fas fa-fire text-orange-500 mr-1"></i>Tiempo de cocción (min)
            </label>
            <input type="number" id="${this.formId}CookTime" min="0" 
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value="${data.cookTime || 0}"
              placeholder="0">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">
            <i class="fas fa-shopping-basket text-green-500 mr-1"></i>Ingredientes *
          </label>
          <textarea id="${this.formId}Ingredients" required rows="3" 
            class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Un ingrediente por línea">${data.ingredients || ''}</textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">
            <i class="fas fa-list-ol text-indigo-500 mr-1"></i>Instrucciones *
          </label>
          <textarea id="${this.formId}Instructions" required rows="4" 
            class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Paso a paso de la preparación">${data.instructions || ''}</textarea>
        </div>
        
        <div class="flex space-x-2">
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <i class="fas fa-save mr-2"></i>${isEdit ? 'Actualizar' : 'Guardar'}
          </button>
          ${this.onCancel ? `
            <button type="button" onclick="${this.onCancel}" 
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              <i class="fas fa-undo mr-2"></i>Cancelar
            </button>
          ` : ''}
        </div>
      </form>
    `;
  }

  getData() {
    return {
      id: document.getElementById(`${this.formId}Id`).value || null,
      name: document.getElementById(`${this.formId}Name`).value.trim(),
      category: document.getElementById(`${this.formId}Category`).value,
      prepTime: parseInt(document.getElementById(`${this.formId}PrepTime`).value) || 0,
      cookTime: parseInt(document.getElementById(`${this.formId}CookTime`).value) || 0,
      ingredients: document.getElementById(`${this.formId}Ingredients`).value.trim(),
      instructions: document.getElementById(`${this.formId}Instructions`).value.trim()
    };
  }

  reset() {
    document.getElementById(this.formId)?.reset();
  }

  fillData(data) {
    document.getElementById(`${this.formId}Id`).value = data.id || '';
    document.getElementById(`${this.formId}Name`).value = data.name || '';
    document.getElementById(`${this.formId}Category`).value = data.category || 'general';
    document.getElementById(`${this.formId}PrepTime`).value = data.prepTime || 0;
    document.getElementById(`${this.formId}CookTime`).value = data.cookTime || 0;
    document.getElementById(`${this.formId}Ingredients`).value = data.ingredients || '';
    document.getElementById(`${this.formId}Instructions`).value = data.instructions || '';
  }
}

export const createRecipeForm = (options) => new RecipeForm(options);
