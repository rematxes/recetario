const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const RECIPES_FILE = path.join(DATA_DIR, 'recipes.json');
const MENUS_FILE = path.join(DATA_DIR, 'menus.json');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Users configuration (hardcoded for Sara and Sergio)
const USERS = [
  {
    username: 'sara',
    passwordHash: process.env.SARA_PASSWORD_HASH || ''
  },
  {
    username: 'sergio',
    passwordHash: process.env.SERGIO_PASSWORD_HASH || ''
  }
].filter(user => user.passwordHash); // Only include users with password hash configured

module.exports = {
  PORT,
  HOST,
  DATA_DIR,
  RECIPES_FILE,
  MENUS_FILE,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  USERS
};
