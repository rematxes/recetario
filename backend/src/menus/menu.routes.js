const express = require('express');
const router = express.Router();
const menuController = require('./menu.controller');

router.get('/', menuController.getAll);
router.get('/:id', menuController.getById);
router.post('/', menuController.create);
router.post('/generate', menuController.generate);
router.put('/:id', menuController.update);
router.delete('/:id', menuController.delete);
router.post('/substitute', menuController.substitute);

module.exports = router;
