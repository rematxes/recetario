const authService = require('../../auth/auth.service');
const { AppError } = require('../errors/AppError');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de autenticación requerido', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = authService.verifyToken(token);

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
