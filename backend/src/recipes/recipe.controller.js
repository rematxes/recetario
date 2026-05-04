const recipeService = require('./recipe.service');

class RecipeController {
  async getAll(req, res, next) {
    try {
      const recipes = await recipeService.getAll();
      res.json(recipes);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const recipe = await recipeService.getById(req.params.id);
      res.json(recipe);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const recipe = await recipeService.create(req.body);
      res.status(201).json(recipe);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const recipe = await recipeService.update(req.params.id, req.body);
      res.json(recipe);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await recipeService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecipeController();
