// jwt.middleware.ts - Middleware JWT para autenticación

import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import prisma from '../../../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

interface UserRole {
  role: {
    nombre: string;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    estado?: string;
    roles?: UserRole[];
  };
}

export const jwtMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; id?: string };

    if (!decoded || (!decoded.sub && !decoded.id)) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Obtener usuario completo con roles
    const userId = decoded.sub || decoded.id;
    console.log('🔐 JWT Middleware - UserID:', userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    console.log('🔐 JWT Middleware - Usuario encontrado:', user?.email);
    console.log('🔐 JWT Middleware - Roles (raw):', JSON.stringify(user?.roles, null, 2));

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Validar que el usuario esté activo
    const isActive = user.estado ? user.estado === 'ACTIVO' : true;
    if (!isActive) {
      return res.status(401).json({ message: 'Usuario inactivo' });
    }

    // Attach user to request
    authReq.user = user;
    console.log('🔐 JWT Middleware - Usuario adjuntado a request');
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
