// local.strategy.ts - Estrategia local para autenticación con Passport

const { Strategy: LocalStrategy } = require('passport-local');
import * as passport from 'passport';
import { UserService } from '../../users/services/user.service';
import * as bcrypt from 'bcryptjs';

const userService = new UserService();

// Configurar estrategia local
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email: string, password: string, done: any) => {
  try {
    const user = await userService.findByEmail(email);
    if (!user || !user.password) {
      return done(null, false, { message: 'Credenciales inválidas' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Credenciales inválidas' });
    }
    if (!user.isActive) {
      return done(null, false, { message: 'Usuario inactivo' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));