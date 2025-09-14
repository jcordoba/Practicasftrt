// user.controller.ts - Controlador para gestión de usuarios

import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto, AssignRolesDto } from '../dtos/user.dto';
import { AuthenticatedRequest } from '../../auth/middlewares/jwt.middleware';
// TODO: Importar guards para JWT y RBAC

const userService = new UserService();

// [ADMIN] Obtener todos los usuarios
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(500).json({ message: errorMessage });
  }
};

// [AUTHENTICATED] Obtener mi perfil
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    // Asumiendo req.user del JWT guard
    const user = await userService.findOne(authReq.user!.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(500).json({ message: errorMessage });
  }
};

// [ADMIN] Crear usuario local
export const createUser = async (req: Request, res: Response) => {
  try {
    const createUserDto: CreateUserDto = req.body;
    const user = await userService.create(createUserDto);
    res.status(201).json(user);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(400).json({ message: errorMessage });
  }
};

// [ADMIN] Actualizar usuario
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updateUserDto: UpdateUserDto = req.body;
    const user = await userService.update(id, updateUserDto);
    res.json(user);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(400).json({ message: errorMessage });
  }
};

// [ADMIN] Asignar roles
export const assignRoles = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const assignRolesDto: AssignRolesDto = req.body;
    await userService.assignRoles(id, assignRolesDto);
    res.json({ message: 'Roles asignados exitosamente' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(400).json({ message: errorMessage });
  }
};

// [AUTHENTICATED] Obtener roles del usuario
export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const roles = await userService.getUserRoles(id);
    res.json(roles);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(400).json({ message: errorMessage });
  }
};

// [AUTHENTICATED] Obtener permisos del usuario
export const getUserPermissions = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const permissions = await userService.getUserPermissions(id);
    res.json(permissions);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(400).json({ message: errorMessage });
  }
};

// [AUTHENTICATED] Obtener mis roles
export const getMyRoles = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const roles = await userService.getUserRoles(authReq.user!.id);
    res.json(roles);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(400).json({ message: errorMessage });
  }
};

// [AUTHENTICATED] Obtener mis permisos
export const getMyPermissions = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const permissions = await userService.getUserPermissions(authReq.user!.id);
    res.json(permissions);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(400).json({ message: errorMessage });
  }
};

// [AUTHENTICATED] Verificar si tengo un permiso específico
export const checkMyPermission = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { permission } = req.params;
    const hasPermission = await userService.hasPermission(authReq.user!.id, permission);
    res.json({ hasPermission });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(400).json({ message: errorMessage });
  }
};

// [AUTHENTICATED] Verificar si tengo un rol específico
export const checkMyRole = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { role } = req.params;
    const hasRole = await userService.hasRole(authReq.user!.id, role);
    res.json({ hasRole });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(400).json({ message: errorMessage });
  }
};

// [ADMIN] Activar/Desactivar usuario
export const activateDeactivateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { isActive } = req.body;
    await userService.activateDeactivate(id, isActive);
    res.json({ message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente` });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(400).json({ message: errorMessage });
  }
};