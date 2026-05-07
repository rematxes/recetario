const express = require('express');
const router = express.Router();
const recipeController = require('./recipe.controller');

router.get('/', recipeController.getAll);
router.get('/:id', recipeController.getById);
router.post('/', recipeController.create);
router.put('/:id', recipeController.update);
router.delete('/:id', recipeController.delete);

module.exports = router;
