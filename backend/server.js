const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

const DATA_DIR = path.join(__dirname, 'data');
const RECIPES_FILE = path.join(DATA_DIR, 'recipes.json');
const MENUS_FILE = path.join(DATA_DIR, 'menus.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
  
  try {
    await fs.access(RECIPES_FILE);
  } catch {
    await fs.writeFile(RECIPES_FILE, JSON.stringify([], null, 2));
  }
  
  try {
    await fs.access(MENUS_FILE);
  } catch {
    await fs.writeFile(MENUS_FILE, JSON.stringify([], null, 2));
  }
}

async function readData(filename) {
  try {
    const data = await fs.readFile(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

async function writeData(filename, data) {
  try {
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await readData(RECIPES_FILE);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Error reading recipes' });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const { name, description, ingredients, instructions, category, prepTime, cookTime } = req.body;
    
    if (!name || !ingredients || !instructions) {
      return res.status(400).json({ error: 'Name, ingredients, and instructions are required' });
    }
    
    const recipes = await readData(RECIPES_FILE);
    const newRecipe = {
      id: uuidv4(),
      name,
      description: description || '',
      ingredients,
      instructions,
      category: category || 'general',
      prepTime: prepTime || 0,
      cookTime: cookTime || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    recipes.push(newRecipe);
    await writeData(RECIPES_FILE, recipes);
    
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ error: 'Error creating recipe' });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, ingredients, instructions, category, prepTime, cookTime } = req.body;
    
    const recipes = await readData(RECIPES_FILE);
    const recipeIndex = recipes.findIndex(r => r.id === id);
    
    if (recipeIndex === -1) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    recipes[recipeIndex] = {
      ...recipes[recipeIndex],
      name: name || recipes[recipeIndex].name,
      description: description !== undefined ? description : recipes[recipeIndex].description,
      ingredients: ingredients || recipes[recipeIndex].ingredients,
      instructions: instructions || recipes[recipeIndex].instructions,
      category: category !== undefined ? category : recipes[recipeIndex].category,
      prepTime: prepTime !== undefined ? prepTime : recipes[recipeIndex].prepTime,
      cookTime: cookTime !== undefined ? cookTime : recipes[recipeIndex].cookTime,
      updatedAt: new Date().toISOString()
    };
    
    await writeData(RECIPES_FILE, recipes);
    res.json(recipes[recipeIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating recipe' });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recipes = await readData(RECIPES_FILE);
    const filteredRecipes = recipes.filter(r => r.id !== id);
    
    if (recipes.length === filteredRecipes.length) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    await writeData(RECIPES_FILE, filteredRecipes);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting recipe' });
  }
});

app.get('/api/menus', async (req, res) => {
  try {
    const menus = await readData(MENUS_FILE);
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Error reading menus' });
  }
});

app.post('/api/menus/generate', async (req, res) => {
  try {
    const { weekStart } = req.body;
    const recipes = await readData(RECIPES_FILE);
    
        
    if (recipes.length === 0) {
      return res.status(400).json({ error: 'No recipes available to generate menu' });
    }
    
    const startDate = new Date(weekStart || Date.now());
    
    // Get existing menus to determine the next auto number
    const existingMenus = await readData(MENUS_FILE);
    const autoMenuCount = existingMenus.filter(m => m.name && m.name.startsWith('Menú generado')).length + 1;
    
    const menu = {
      id: uuidv4(),
      name: `Menú generado ${autoMenuCount}`,
      weekStart: startDate.toISOString(),
      days: []
    };
    
    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const mealTypes = ['comida', 'cena'];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayMenu = {
        date: currentDate.toISOString(),
        dayName: daysOfWeek[i],
        meals: {}
      };
      
      mealTypes.forEach(mealType => {
        const filteredRecipes = recipes.filter(recipe => recipe.category === mealType || recipe.category === 'general');
        if (filteredRecipes.length === 0) {
          filteredRecipes = recipes.filter(recipe => recipe.category !== 'picoteo' && recipe.category !== 'desayuno');
        }
        const randomRecipe = filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)];
        dayMenu.meals[mealType] = {
          recipeId: randomRecipe.id,
          recipeName: randomRecipe.name,
          prepTime: randomRecipe.prepTime || 0,
          cookTime: randomRecipe.cookTime || 0,
          totalTime: (randomRecipe.prepTime || 0) + (randomRecipe.cookTime || 0)
        };
      });
      
      menu.days.push(dayMenu);
    }
    
    const menus = await readData(MENUS_FILE);
    menus.push(menu);
    await writeData(MENUS_FILE, menus);
    
    res.status(201).json(menu);
  } catch (error) {
    console.error('Error generating menu:', error);
    res.status(500).json({ error: 'Error generating menu', details: error.message });
  }
});

// POST /api/menus - Create menu manually
app.post('/api/menus', async (req, res) => {
  try {
    const { weekStart, days } = req.body;
    
    if (!days || !Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ error: 'Days array is required' });
    }
    
    // Get existing menus to determine the next auto number
    const existingMenus = await readData(MENUS_FILE);
    const autoMenuCount = existingMenus.filter(m => m.name && m.name.startsWith('Menú')).length + 1;
    
    const menu = {
      id: uuidv4(),
      name: weekStart ? `Menú semana ${autoMenuCount}` : `Menú manual ${autoMenuCount}`,
      weekStart: weekStart || new Date().toISOString(),
      days: days,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const menus = await readData(MENUS_FILE);
    menus.push(menu);
    await writeData(MENUS_FILE, menus);
    
    res.status(201).json(menu);
  } catch (error) {
    console.error('Error creating manual menu:', error);
    res.status(500).json({ error: 'Error creating menu', details: error.message });
  }
});

app.put('/api/menus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { days, name } = req.body;
    
    const menus = await readData(MENUS_FILE);
    const menuIndex = menus.findIndex(m => m.id === id);
    
    if (menuIndex === -1) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    
    menus[menuIndex] = {
      ...menus[menuIndex],
      days: days || menus[menuIndex].days,
      name: name || menus[menuIndex].name,
      updatedAt: new Date().toISOString()
    };
    
    await writeData(MENUS_FILE, menus);
    res.json(menus[menuIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating menu' });
  }
});

app.delete('/api/menus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menus = await readData(MENUS_FILE);
    const filteredMenus = menus.filter(m => m.id !== id);
    
    if (menus.length === filteredMenus.length) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    
    await writeData(MENUS_FILE, filteredMenus);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting menu' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

async function startServer() {
  await ensureDataDir();
  
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Access from mobile devices: http://YOUR_LOCAL_IP:${PORT}`);
    console.log(`Network interface: ${HOST}:${PORT}`);
  });
}

startServer().catch(console.error);
