// user.repository.ts - Repositorio para operaciones de base de datos de usuarios

import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/user.dto';
import prisma from '../../../prisma';

// Función para normalizar el modelo de usuario
function normalizeUser(u: any) {
  if (!u) return u;
  return {
    ...u,
    name: u.name ?? u.nombre ?? null,
    isActive: u.isActive ?? (u.estado ? u.estado === 'ACTIVO' : true),
  };
}

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    return normalizeUser(user) as any;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    return normalizeUser(user) as User | null;
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      include: { roles: { include: { role: true } } },
    });
    return users.map(normalizeUser) as any;
  }

  async create(data: any): Promise<User> {
    const user = await prisma.user.create({
      data,
      include: { roles: { include: { role: true } } },
    });
    return user as any;
  }

  async update(id: string, data: { name?: string | null; isActive?: boolean; password?: string | null }): Promise<User> {
    // Si recibimos isActive, traducirlo a estado para persistir
    const toPersist: any = { ...data };
    if (typeof data.isActive === 'boolean') {
      toPersist.estado = data.isActive ? 'ACTIVO' : 'INACTIVO';
      delete toPersist.isActive;
    }
    // Si recibimos name, traducirlo a nombre para persistir
    if (data.name !== undefined) {
      toPersist.nombre = data.name;
      delete toPersist.name;
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: toPersist,
      include: { roles: { include: { role: true } } },
    });
    return normalizeUser(user) as any;
  }

  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    await prisma.userRole.deleteMany({ where: { userId } });
    await prisma.userRole.createMany({
      data: roleIds.map(roleId => ({ userId, roleId })),
    });
  }
}