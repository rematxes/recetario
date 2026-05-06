require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { start } = require('./src/app');
const JsonRepository = require('./src/shared/repositories/JsonRepository');
const { RECIPES_FILE, MENUS_FILE } = require('./src/config');

async function bootstrap() {
  // Ensure data files exist
  const recipeRepo = new JsonRepository(RECIPES_FILE);
  const menuRepo = new JsonRepository(MENUS_FILE);
  
  await recipeRepo.ensureFile();
  await menuRepo.ensureFile();
  
  start();
}

bootstrap().catch(console.error);
