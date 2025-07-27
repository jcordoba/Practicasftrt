// jwt.middleware.ts - Middleware JWT para autenticación

import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../../users/services/user.service';
import { User } from '../../users/entities/user.entity';

const userService = new UserService();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const jwtMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Obtener usuario completo con roles
    const user = await userService.findOne(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Usuario inactivo' });
    }

    authReq.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};