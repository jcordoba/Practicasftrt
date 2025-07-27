import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../modules/auth/middlewares/jwt.middleware';

export const roleGuard = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;

    if (!user || !user.roles) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const userRoles = user.roles.map((userRole: any) => userRole.role.name);
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};