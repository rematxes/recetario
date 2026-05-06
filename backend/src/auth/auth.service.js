const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { USERS, JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const { AppError } = require('../shared/errors/AppError');

class AuthService {
  async login(username, password) {
    console.log('[AuthService] Login attempt for username:', username);
    console.log('[AuthService] Available users:', USERS.map(u => ({ username: u.username, hasPassword: !!u.passwordHash })));

    // Find user by username
    const user = USERS.find(u => u.username === username);

    if (!user) {
      console.log('[AuthService] User not found:', username);
      throw new AppError('Usuario o contraseña incorrectos', 401);
    }

    if (!user.passwordHash) {
      console.log('[AuthService] User has no password hash configured:', username);
      throw new AppError('Usuario no configurado correctamente. Contacta al administrador.', 500);
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);

    if (!isPasswordValid) {
      console.log('[AuthService] Invalid password for user:', username);
      throw new AppError('Usuario o contraseña incorrectos', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('[AuthService] Login successful for user:', username);
    return {
      token,
      username: user.username
    };
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token expirado', 401);
      } else if (error.name === 'JsonWebTokenError') {
        throw new AppError('Token inválido', 401);
      }
      throw error;
    }
  }
}

module.exports = new AuthService();
