const JsonRepository = require('../shared/repositories/JsonRepository');
const { RECIPES_FILE } = require('../config');

class RecipeRepository extends JsonRepository {
  constructor() {
    super(RECIPES_FILE);
  }

  async findByCategory(category) {
    return this.filter(recipe => recipe.category === category);
  }

  async findByCategories(categories) {
    return this.filter(recipe => categories.includes(recipe.category));
  }

  async findAvailableForMeal(mealType) {
    return this.filter(recipe => 
      recipe.category === mealType || recipe.category === 'general'
    );
  }

  async getRandomForMeal(mealType) {
    const available = await this.findAvailableForMeal(mealType);
    if (available.length === 0) {
      // Fallback: any recipe except snacks
      const fallback = await this.filter(recipe =>
        recipe.category !== 'picoteo'
      );
      if (fallback.length === 0) return null;
      return fallback[Math.floor(Math.random() * fallback.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  }
}

module.exports = new RecipeRepository();
