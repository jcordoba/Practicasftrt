// user.repository.ts - Repositorio para operaciones de base de datos de usuarios

import { User } from '../entities/user.entity';
import prisma from '../../../prisma';

interface PrismaUserData {
  name?: string | null;
  nombre?: string | null;
  isActive?: boolean;
  estado?: string;
  [key: string]: unknown;
}

// Función para normalizar el modelo de usuario
function normalizeUser(u: unknown) {
  if (!u) return u;
  const userData = u as PrismaUserData;
  return {
    ...u,
    name: userData.name ?? userData.nombre ?? null,
    isActive: userData.isActive ?? (userData.estado ? userData.estado === 'ACTIVO' : true),
  };
}

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    return normalizeUser(user) as User | null;
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
    return users.map(normalizeUser) as User[];
  }

  async create(data: Partial<User> & { nombre?: string }): Promise<User> {
    // Transformar campos si es necesario
    const toPersist: Record<string, unknown> = { ...data };

    // Si recibimos name y no nombre, copiar a nombre
    if (data.name !== undefined && !data.nombre) {
      toPersist.nombre = data.name;
    }

    // Si recibimos nombre y no name, copiar a name
    if (data.nombre !== undefined && !data.name) {
      toPersist.name = data.nombre;
    }

    const user = await prisma.user.create({
      data: toPersist as Parameters<typeof prisma.user.create>[0]['data'],
      include: { roles: { include: { role: true } } },
    });
    return normalizeUser(user) as User;
  }

  async update(
    id: string,
    data: { name?: string | null; isActive?: boolean; password?: string | null },
  ): Promise<User> {
    // Si recibimos isActive, traducirlo a estado para persistir
    const toPersist: Record<string, unknown> = { ...data };
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
    return normalizeUser(user) as User;
  }

  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    await prisma.userRole.deleteMany({ where: { userId } });
    await prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId, roleId })),
    });
  }
}
