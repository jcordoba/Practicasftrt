// role.controller.ts - Controlador para gestión de roles

import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';

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

// [ADMIN] Sembrar roles predeterminados
export const seedRoles = async (req: Request, res: Response) => {
  try {
    await roleService.seedRoles();
    res.json({ message: 'Roles predeterminados creados exitosamente' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
export const getRoles = (req: Request, res: Response) => {
  res.send('Lista de roles');
};