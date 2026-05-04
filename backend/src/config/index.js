const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const RECIPES_FILE = path.join(DATA_DIR, 'recipes.json');
const MENUS_FILE = path.join(DATA_DIR, 'menus.json');

module.exports = {
  PORT,
  HOST,
  DATA_DIR,
  RECIPES_FILE,
  MENUS_FILE
};
