const menuService = require('./menu.service');

class MenuController {
  async getAll(req, res, next) {
    try {
      const menus = await menuService.getAll();
      res.json(menus);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const menu = await menuService.getById(req.params.id);
      res.json(menu);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const menu = await menuService.create(req.body);
      res.status(201).json(menu);
    } catch (error) {
      next(error);
    }
  }

  async generate(req, res, next) {
    try {
      const { weekStart } = req.body;
      const menu = await menuService.generateWeeklyMenu(weekStart);
      res.status(201).json(menu);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const menu = await menuService.update(req.params.id, req.body);
      res.json(menu);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await menuService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async substitute(req, res, next) {
    try {
      const { menuId, dayIndex, mealType, recipeId } = req.body;
      
      if (!menuId || dayIndex === undefined || !mealType || !recipeId) {
        return res.status(400).json({ 
          error: 'menuId, dayIndex, mealType, and recipeId are required' 
        });
      }

      const updated = await menuService.substituteRecipe(
        menuId, 
        parseInt(dayIndex), 
        mealType, 
        recipeId
      );
      
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MenuController();
