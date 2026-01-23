// rbac.guard.ts - Middleware RBAC para control de acceso basado en roles y permisos

import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest } from './jwt.middleware';
import { UserService } from '../../users/services/user.service';

const userService = new UserService();

// Middleware RBAC para Express basado en roles
export const rbacMiddleware = (requiredRoles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    console.log('🔍 RBAC Middleware Debug:');
    console.log('Usuario:', authReq.user.email);
    console.log('Roles del usuario (raw):', JSON.stringify(authReq.user.roles, null, 2));

    const userRoles =
      authReq.user.roles?.map((ur: { role: { nombre: string } }) => ur.role.nombre) || [];
    console.log('Roles extraídos:', userRoles);
    console.log('Roles requeridos:', requiredRoles);

    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));
    console.log('Tiene rol requerido:', hasRequiredRole);

    if (!hasRequiredRole) {
      console.log('❌ Acceso denegado');
      return res.status(403).json({ message: 'Acceso denegado: roles insuficientes' });
    }

    console.log('✅ Acceso permitido');
    next();
  };
};

// Middleware RBAC para Express basado en permisos
export const permissionMiddleware = (requiredPermissions: string[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    try {
      const userPermissions = await userService.getUserPermissions(authReq.user.id);
      const userPermissionNames = userPermissions.map((p) => p.nombre);

      const hasRequiredPermission = requiredPermissions.some((permission) =>
        userPermissionNames.includes(permission),
      );

      if (!hasRequiredPermission) {
        return res.status(403).json({ message: 'Acceso denegado: permisos insuficientes' });
      }

      next();
    } catch {
      return res.status(500).json({ message: 'Error al verificar permisos' });
    }
  };
};

// Middleware combinado que verifica tanto roles como permisos (OR logic)
export const rbacOrPermissionMiddleware = (
  requiredRoles: string[],
  requiredPermissions: string[],
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    try {
      // Check roles first
      const userRoles =
        authReq.user.roles?.map((ur: { role: { nombre: string } }) => ur.role.nombre) || [];
      const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

      if (hasRequiredRole) {
        return next();
      }

      // If no required role, check permissions
      const userPermissions = await userService.getUserPermissions(authReq.user.id);
      const userPermissionNames = userPermissions.map((p) => p.nombre);

      const hasRequiredPermission = requiredPermissions.some((permission) =>
        userPermissionNames.includes(permission),
      );

      if (!hasRequiredPermission) {
        return res.status(403).json({ message: 'Acceso denegado: roles o permisos insuficientes' });
      }

      next();
    } catch {
      return res.status(500).json({ message: 'Error al verificar acceso' });
    }
  };
};
