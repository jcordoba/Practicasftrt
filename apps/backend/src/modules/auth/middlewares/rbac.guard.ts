// rbac.guard.ts - Middleware RBAC para control de acceso basado en roles

import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest } from './jwt.middleware';

// Middleware RBAC para Express
export const rbacMiddleware = (requiredRoles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const userRoles = authReq.user.roles?.map((ur: any) => ur.role.name) || [];
    
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({ message: 'Acceso denegado: roles insuficientes' });
    }
    
    next();
  };
};