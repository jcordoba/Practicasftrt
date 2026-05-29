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
    // Transformar campos y eliminar campos no válidos para Prisma
    const { name, ...restData } = data;

    const toPersist: Record<string, unknown> = { ...restData };

    // Si recibimos name, copiar a nombre
    if (name !== undefined && !toPersist.nombre) {
      toPersist.nombre = name;
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
    // Eliminar campos no válidos para Prisma y transformar
    const { name, isActive, ...restData } = data;
    const toPersist: Record<string, unknown> = { ...restData };

    // Si recibimos isActive, traducirlo a estado
    if (typeof isActive === 'boolean') {
      toPersist.estado = isActive ? 'ACTIVO' : 'INACTIVO';
    }
    // Si recibimos name, traducirlo a nombre
    if (name !== undefined) {
      toPersist.nombre = name;
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
