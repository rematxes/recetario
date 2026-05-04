const recipeRepository = require('./recipe.repository');
const { Recipe } = require('./recipe.entity');
const { NotFoundError, ValidationError } = require('../shared/errors/AppError');

class RecipeService {
  async getAll() {
    return recipeRepository.readAll();
  }

  async getById(id) {
    const recipe = await recipeRepository.findById(id);
    if (!recipe) {
      throw new NotFoundError('Recipe');
    }
    return recipe;
  }

  async create(data) {
    const recipeData = Recipe.fromRequest(data);
    const errors = Recipe.validate(recipeData);
    
    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }

    return recipeRepository.create(recipeData);
  }

  async update(id, data) {
    const existing = await recipeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Recipe');
    }

    const updates = {};
    
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.description !== undefined) updates.description = data.description.trim();
    if (data.ingredients !== undefined) updates.ingredients = data.ingredients.trim();
    if (data.instructions !== undefined) updates.instructions = data.instructions.trim();
    if (data.category !== undefined) updates.category = data.category;
    if (data.prepTime !== undefined) updates.prepTime = parseInt(data.prepTime) || 0;
    if (data.cookTime !== undefined) updates.cookTime = parseInt(data.cookTime) || 0;

    const errors = Recipe.validate({ ...existing, ...updates });
    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }

    return recipeRepository.update(id, updates);
  }

  async delete(id) {
    const deleted = await recipeRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Recipe');
    }
  }
}

module.exports = new RecipeService();
