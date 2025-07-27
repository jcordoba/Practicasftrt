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
    const filter = { programId: req.query.programId as string };
    const users = await userService.findAll(filter);
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
    if (createUserDto.programId) {
      // TODO: Validar existencia real del programa en base de datos
    }
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
    if (updateUserDto.programId) {
      // TODO: Validar existencia real del programa en base de datos
    }
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