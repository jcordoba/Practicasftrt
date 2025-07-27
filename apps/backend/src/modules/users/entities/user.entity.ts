// user.entity.ts - Entidad para usuarios

import { Role } from '../../roles/entities/role.entity';

// Interfaz que coincide con la estructura de Prisma
export interface UserRole {
  roleId: string;
  userId: string;
  role: Role;
}

export class User {
  id: string = '';
  email: string = '';
  password: string | null = null;
  name: string | null = null;
  isActive: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  roles: UserRole[] = [];
}