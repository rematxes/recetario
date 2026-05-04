const CATEGORIES = ['general', 'desayuno', 'comida', 'cena', 'picoteo', 'dulce'];

class Recipe {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.ingredients = data.ingredients;
    this.instructions = data.instructions;
    this.category = data.category || 'general';
    this.prepTime = data.prepTime || 0;
    this.cookTime = data.cookTime || 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static validate(data) {
    const errors = [];
    
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string');
    }
    
    if (!data.ingredients || typeof data.ingredients !== 'string' || data.ingredients.trim().length === 0) {
      errors.push('Ingredients are required and must be a non-empty string');
    }
    
    if (!data.instructions || typeof data.instructions !== 'string' || data.instructions.trim().length === 0) {
      errors.push('Instructions are required and must be a non-empty string');
    }
    
    if (data.category && !CATEGORIES.includes(data.category)) {
      errors.push(`Category must be one of: ${CATEGORIES.join(', ')}`);
    }
    
    if (data.prepTime !== undefined && (isNaN(data.prepTime) || data.prepTime < 0)) {
      errors.push('Prep time must be a non-negative number');
    }
    
    if (data.cookTime !== undefined && (isNaN(data.cookTime) || data.cookTime < 0)) {
      errors.push('Cook time must be a non-negative number');
    }
    
    return errors;
  }

  static fromRequest(data) {
    return {
      name: data.name?.trim(),
      ingredients: data.ingredients?.trim(),
      instructions: data.instructions?.trim(),
      category: data.category || 'general',
      prepTime: parseInt(data.prepTime) || 0,
      cookTime: parseInt(data.cookTime) || 0
    };
  }

  get totalTime() {
    return this.prepTime + this.cookTime;
  }
}

module.exports = { Recipe, CATEGORIES };
