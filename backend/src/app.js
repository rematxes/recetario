const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT, HOST } = require('./config');
const errorHandler = require('./shared/middleware/errorHandler');
const recipeRoutes = require('./recipes/recipe.routes');
const menuRoutes = require('./menus/menu.routes');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/menus', menuRoutes);

// Static files with proper MIME types
app.use(express.static(path.join(__dirname, '..', '..', 'frontend'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Fallback for SPA - only for non-API, non-file routes
app.get('*', (req, res) => {
  // Don't serve index.html for JS/CSS file requests
  if (req.path.endsWith('.js') || req.path.endsWith('.css')) {
    return res.status(404).send('File not found');
  }
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'index.html'));
});

// Error handling
app.use(errorHandler);

function start() {
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Access from mobile devices: http://YOUR_LOCAL_IP:${PORT}`);
    console.log(`Network interface: ${HOST}:${PORT}`);
  });
}

module.exports = { app, start };
