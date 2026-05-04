const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MEAL_TYPES = ['comida', 'cena'];

class Menu {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.weekStart = data.weekStart;
    this.days = data.days || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static validate(data) {
    const errors = [];
    
    if (data.days !== undefined) {
      if (!Array.isArray(data.days)) {
        errors.push('Days must be an array');
      } else if (data.days.length === 0) {
        errors.push('Days array cannot be empty');
      } else {
        data.days.forEach((day, index) => {
          if (!day.date) {
            errors.push(`Day ${index + 1}: date is required`);
          }
          if (!day.dayName || !DAYS_OF_WEEK.includes(day.dayName)) {
            errors.push(`Day ${index + 1}: valid dayName is required`);
          }
          if (!day.meals || typeof day.meals !== 'object') {
            errors.push(`Day ${index + 1}: meals object is required`);
          }
        });
      }
    }
    
    return errors;
  }

  static generateDayMenu(recipe, mealType) {
    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      prepTime: recipe.prepTime || 0,
      cookTime: recipe.cookTime || 0,
      totalTime: (recipe.prepTime || 0) + (recipe.cookTime || 0)
    };
  }

  static createEmptyDay(date, dayName) {
    return {
      date: date.toISOString(),
      dayName,
      meals: {}
    };
  }
}

module.exports = { Menu, DAYS_OF_WEEK, MEAL_TYPES };
