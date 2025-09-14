// auth.service.ts - Servicio para autenticación y manejo de tokens

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../../users/services/user.service';
import { User } from '../../users/entities/user.entity';

const userService = new UserService();

export interface LoginResponse {
  access_token: string;
  user: Omit<User, 'password'>;
}

export class AuthService {
  // Buscar usuario por email (no validamos la contraseña aquí)
  async validateUser(email: string): Promise<User | null> {
    let user = await userService.findByEmail(email);

    if (!user) {
      // Si el usuario no existe, lo creamos automáticamente con contraseña temporal
      user = await userService.create({ 
        email,
        password: '', // se debe actualizar luego con contraseña segura
        name: email.split('@')[0],
      });
    }

    return user.isActive ? user : null;
  }

  // Validar contraseña (llamado desde el controlador)
  async validatePassword(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
  }

  // Generar token y devolver usuario sin contraseña
  async login(user: User): Promise<LoginResponse> {
    const payload = { 
      email: user.email, 
      sub: user.id,
      roles: user.roles?.map(ur => {
        if (typeof ur === 'object' && ur !== null) {
          return (ur as any).role?.name || (ur as any).name || 'ESTUDIANTE';
        }
        return 'ESTUDIANTE';
      }) || []
    };
    
    const access_token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    } as jwt.SignOptions);

    const { password, ...userWithoutPassword } = user as any;
    
    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  // Login con Google (crea automáticamente si no existe)
  async googleLogin(profile: any): Promise<LoginResponse> {
    const { emails, name } = profile;
    const email = emails[0].value;

    if (!email.endsWith('@unac.edu.co')) {
      throw new Error('El correo debe ser del dominio @unac.edu.co');
    }

    let user = await userService.findByEmail(email);
    
    if (!user) {
      user = await userService.create({
        email,
        name: `${name.givenName} ${name.familyName}`,
      });
    }

    if (!user.isActive) {
      throw new Error('Usuario inactivo');
    }

    return this.login(user);
  }

  // Verificación del token
  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await userService.findOne(payload.sub);
      return user && user.isActive ? user : null;
    } catch (error) {
      return null;
    }
  }
}
