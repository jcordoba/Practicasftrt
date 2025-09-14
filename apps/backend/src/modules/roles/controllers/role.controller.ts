// role.controller.ts - Controlador para gestión de roles

import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from '../dtos/role.dto';
import { AuthenticatedRequest } from '../../auth/middlewares/jwt.middleware';

const roleService = new RoleService();

// [ADMIN] Obtener todos los roles
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await roleService.getAllRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// [ADMIN] Obtener un rol por ID
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await roleService.getRoleById(id);
    
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// [ADMIN] Crear un nuevo rol
export const createRole = async (req: Request, res: Response) => {
  try {
    const createRoleDto: CreateRoleDto = req.body;
    const role = await roleService.createRole(createRoleDto);
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// [ADMIN] Actualizar un rol
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateRoleDto: UpdateRoleDto = req.body;
    const role = await roleService.updateRole(id, updateRoleDto);
    
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// [ADMIN] Eliminar un rol
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await roleService.deleteRole(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    res.json({ message: 'Rol eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// [ADMIN] Asignar permisos a un rol
export const assignPermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignPermissionsDto: AssignPermissionsDto = req.body;
    
    const role = await roleService.assignPermissions(id, assignPermissionsDto.permissionIds);
    
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// [ADMIN] Obtener permisos de un rol
export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const permissions = await roleService.getRolePermissions(id);
    
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// [ADMIN] Sembrar roles predeterminados
export const seedRoles = async (req: Request, res: Response) => {
  try {
    await roleService.seedRoles();
    res.json({ message: 'Roles predeterminados creados exitosamente' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Alias para compatibilidad
export const getRoles = getAllRoles;