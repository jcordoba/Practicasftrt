// google.strategy.ts - Estrategia Google OAuth para autenticación con Passport

import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import * as passport from 'passport';
import { UserService } from '../../users/services/user.service';
import { RoleService } from '../../roles/services/role.service';
import { CreateUserDto } from '../../users/dtos/user.dto';

const userService = new UserService();
const roleService = new RoleService();

// Configurar estrategia de Google
passport.use(new Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  scope: ['email', 'profile'],
}, async (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) => {
  try {
    const { name, emails } = profile;
  const email = emails && emails[0] ? emails[0].value : null;
  
  if (!email) {
    return done(new Error('No se pudo obtener el email del perfil'), false);
  }

    // Validar que el correo sea del dominio @unac.edu.co
    if (!email.endsWith('@unac.edu.co')) {
      return done(new Error('El correo debe ser del dominio @unac.edu.co'), false);
    }

    try {
      let user = await userService.findByEmail(email);
      
      if (!user) {
        // Crear usuario automáticamente si no existe
        const createUserDto: CreateUserDto = {
          email,
          name: name?.givenName && name?.familyName ? `${name.givenName} ${name.familyName}` : email.split('@')[0],
          password: '' as string | null,
          programId: undefined as string | undefined
        };
        user = await userService.create(createUserDto);
        
        // Asignar rol de estudiante por defecto
        const studentRole = await roleService.findByName('ESTUDIANTE');
        if (studentRole) {
          await userService.assignRoles(user.id, { roleIds: [studentRole.id] });
        }
      }
      
      if (!user.isActive) {
        return done(new Error('Usuario inactivo'), false);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error as Error, false);
    }
  } catch (error) {
    return done(error as Error, false);
  }
}));