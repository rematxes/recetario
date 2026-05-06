const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { PORT, HOST } = require('./config');
const errorHandler = require('./shared/middleware/errorHandler');
const authMiddleware = require('./shared/middleware/authMiddleware');
const authRoutes = require('./auth/auth.routes');
const recipeRoutes = require('./recipes/recipe.routes');
const menuRoutes = require('./menus/menu.routes');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
    },
  },
}));

// Rate limiting for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Demasiados intentos de login. Intenta de nuevo más tarde.'
});

app.use(cors());
app.use(express.json());

// Auth routes - no authentication required
app.use('/api/auth', loginLimiter, authRoutes);

// API Routes - authentication required
app.use('/api/recipes', authMiddleware, recipeRoutes);
app.use('/api/menus', authMiddleware, menuRoutes);

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
