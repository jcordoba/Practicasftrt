// jwt.guard.ts - Guard JWT para proteger rutas autenticadas

// Importamos los tipos necesarios sin depender de NestJS
import * as jwt from 'jsonwebtoken';
import { UserService } from '../../users/services/user.service';
import { Request, Response, NextFunction } from 'express';

// Middleware de Express para verificar JWT
export class JwtAuthGuard {
  constructor(private userService: UserService) {}

  // Middleware para Express
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = this.extractTokenFromHeader(req);
    
    if (!token) {
      res.status(401).json({ message: 'Token no proporcionado' });
      return;
    }

    try {
      // Usamos una variable para el secreto con un valor por defecto
      const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
      const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
      
      // Verificamos que payload.sub exista
      if (!payload.sub) {
        res.status(401).json({ message: 'Token inválido' });
        return;
      }
      
      const user = await this.userService.findOne(payload.sub);
      
      if (!user || !user.isActive) {
        res.status(401).json({ message: 'Usuario no válido o inactivo' });
        return;
      }
      
      req.user = user;
      next();
    } catch (error: any) {
      res.status(401).json({ message: 'Token inválido: ' + error.message });
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}