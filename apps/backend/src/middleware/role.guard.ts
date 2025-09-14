import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../modules/auth/middlewares/jwt.middleware';

export const roleGuard = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('=== ROLE GUARD CALLED ===');
    console.log('Request path:', req.path);
    console.log('Request method:', req.method);
    
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    
    console.log('User object exists:', !!user);
    console.log('User roles exists:', !!(user && user.roles));

    if (!user || !user.roles) {
      console.log('Access denied: No user or roles');
      return res.status(403).json({ message: 'Forbidden' });
    }

    const userRoles = user.roles.map((userRole: any) => userRole.role.name);
    console.log('User roles:', userRoles);
    console.log('Required roles:', requiredRoles);
    
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    console.log('Has required role:', hasRequiredRole);

    if (!hasRequiredRole) {
      console.log('Access denied: Insufficient permissions');
      return res.status(403).json({ message: 'Forbidden' });
    }

    console.log('Access granted');
    next();
  };
};