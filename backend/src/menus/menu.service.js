const menuRepository = require('./menu.repository');
const recipeRepository = require('../recipes/recipe.repository');
const { Menu, DAYS_OF_WEEK, MEAL_TYPES } = require('./menu.entity');
const { NotFoundError, ValidationError } = require('../shared/errors/AppError');

class MenuService {
  async getAll() {
    return menuRepository.readAll();
  }

  async getById(id) {
    const menu = await menuRepository.findById(id);
    if (!menu) {
      throw new NotFoundError('Menu');
    }
    return menu;
  }

  async create(data) {
    const errors = Menu.validate(data);
    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }

    const prefix = data.weekStart ? 'Menú semana ' : 'Menú manual ';
    const autoNumber = await menuRepository.getNextAutoNumber(prefix);
    
    const menuData = {
      name: data.name || `${prefix}${autoNumber}`,
      weekStart: data.weekStart || new Date().toISOString(),
      days: data.days
    };

    return menuRepository.create(menuData);
  }

  async generateWeeklyMenu(weekStart) {
    const startDate = new Date(weekStart || Date.now());
    const autoNumber = await menuRepository.getNextAutoNumber('Menú generado ');
    
    const menu = {
      name: `Menú generado ${autoNumber}`,
      weekStart: startDate.toISOString(),
      days: []
    };

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayMenu = Menu.createEmptyDay(currentDate, DAYS_OF_WEEK[i]);
      
      for (const mealType of MEAL_TYPES) {
        const randomRecipe = await recipeRepository.getRandomForMeal(mealType);
        if (randomRecipe) {
          dayMenu.meals[mealType] = Menu.generateDayMenu(randomRecipe, mealType);
        }
      }
      
      menu.days.push(dayMenu);
    }

    return menuRepository.create(menu);
  }

  async update(id, data) {
    const existing = await menuRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Menu');
    }

    const updates = {};
    
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.days !== undefined) updates.days = data.days;
    
    const errors = Menu.validate({ ...existing, ...updates });
    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }

    return menuRepository.update(id, updates);
  }

  async delete(id) {
    const deleted = await menuRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Menu');
    }
  }

  async substituteRecipe(menuId, dayIndex, mealType, recipeId) {
    const menu = await menuRepository.findById(menuId);
    if (!menu) {
      throw new NotFoundError('Menu');
    }

    const recipe = await recipeRepository.findById(recipeId);
    if (!recipe) {
      throw new NotFoundError('Recipe');
    }

    const updated = await menuRepository.updateMeal(
      menuId, 
      dayIndex, 
      mealType, 
      Menu.generateDayMenu(recipe, mealType)
    );
    
    if (!updated) {
      throw new NotFoundError('Day in menu');
    }
    
    return updated;
  }
}

module.exports = new MenuService();
