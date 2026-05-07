const JsonRepository = require('../shared/repositories/JsonRepository');
const { MENUS_FILE } = require('../config');

class MenuRepository extends JsonRepository {
  constructor() {
    super(MENUS_FILE);
  }

  async getNextAutoNumber(prefix) {
    const menus = await this.readAll();
    const count = menus.filter(m => m.name && m.name.startsWith(prefix)).length;
    return count + 1;
  }

  async findByWeekStart(weekStart) {
    return this.findBy(menu => menu.weekStart === weekStart);
  }

  async updateMeal(menuId, dayIndex, mealType, mealData) {
    const menus = await this.readAll();
    const index = menus.findIndex(m => m.id === menuId);
    
    if (index === -1) return null;
    
    if (!menus[index].days[dayIndex]) {
      return null;
    }
    
    menus[index].days[dayIndex].meals[mealType] = mealData;
    menus[index].updatedAt = new Date().toISOString();
    
    await this._writeAll(menus);
    return menus[index];
  }
}

module.exports = new MenuRepository();
