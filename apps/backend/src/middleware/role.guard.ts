import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../modules/auth/middlewares/jwt.middleware';

export const roleGuard = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;

    if (!user || !user.roles) {
      return res.status(403).json({ message: 'Acceso denegado: usuario no autenticado' });
    }

    // Extract role names, handling both 'nombre' and 'name' fields
    const userRoles = user.roles
      .map((userRole: { role: { nombre?: string; name?: string } }) => {
        return userRole.role.nombre || userRole.role.name;
      })
      .filter(Boolean);

    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ message: 'Acceso denegado: roles insuficientes' });
    }

    next();
  };
};
