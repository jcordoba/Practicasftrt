// permission.controller.ts - Controlador para gestión de permisos

import { Request, Response } from 'express';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto, UpdatePermissionDto, AssignPermissionsToRoleDto } from '../dtos/permission.dto';
import { AuthenticatedRequest } from '../../auth/middlewares/jwt.middleware';

const permissionService = new PermissionService();

// [ADMIN] Obtener todos los permisos
export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await permissionService.getAllPermissions();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// [ADMIN] Obtener permisos por módulo
export const getPermissionsByModule = async (req: Request, res: Response) => {
  try {
    const { modulo } = req.params;
    const permissions = await permissionService.getPermissionsByModule(modulo);
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// [ADMIN] Obtener permiso por ID
export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const permission = await permissionService.getPermissionById(id);
    
    if (!permission) {
      return res.status(404).json({ message: 'Permiso no encontrado' });
    }
    
    res.json(permission);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// [ADMIN] Crear nuevo permiso
export const createPermission = async (req: Request, res: Response) => {
  try {
    const dto: CreatePermissionDto = req.body;
    const permission = await permissionService.createPermission(dto);
    res.status(201).json(permission);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// [ADMIN] Actualizar permiso
export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dto: UpdatePermissionDto = req.body;
    const permission = await permissionService.updatePermission(id, dto);
    
    if (!permission) {
      return res.status(404).json({ message: 'Permiso no encontrado' });
    }
    
    res.json(permission);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// [ADMIN] Eliminar permiso (soft delete)
export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await permissionService.deletePermission(id);
    res.json({ message: 'Permiso eliminado exitosamente' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// [ADMIN] Sembrar permisos predeterminados
export const seedPermissions = async (req: Request, res: Response) => {
  try {
    await permissionService.seedPermissions();
    res.json({ message: 'Permisos predeterminados creados exitosamente' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// [AUTHENTICATED] Obtener mis permisos
export const getMyPermissions = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    const permissions = await permissionService.getUserPermissions(userId);
    res.json({ permissions });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// [AUTHENTICATED] Verificar si tengo un permiso específico
export const checkPermission = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const { permission } = req.params;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    const hasPermission = await permissionService.hasPermission(userId, permission);
    res.json({ hasPermission });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};