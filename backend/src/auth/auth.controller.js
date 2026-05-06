const authService = require('./auth.service');

class AuthController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
      }

      const result = await authService.login(username, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
