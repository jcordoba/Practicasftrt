// user.repository.ts - Repositorio para operaciones de base de datos de usuarios

import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/user.dto';
import { prisma } from '../../../prisma';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    return user as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    return user as User | null;
  }

  async findAll(filter?: { programId?: string }): Promise<User[]> {
    const where = filter?.programId ? { programId: filter.programId } : {};
    const users = await prisma.user.findMany({
      where: where as any,
      include: { roles: { include: { role: true } } },
    });
    return users as User[];
  }

  async create(data: { email: string; password?: string | null; name?: string | null; programId?: string }): Promise<User> {
    const user = await prisma.user.create({
      data,
      include: { roles: { include: { role: true } } },
    });
    return user as User;
  }

  async update(id: string, data: { name?: string | null; isActive?: boolean; password?: string | null }): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data,
      include: { roles: { include: { role: true } } },
    });
    return user as User;
  }

  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    await prisma.userRole.deleteMany({ where: { userId } });
    await prisma.userRole.createMany({
      data: roleIds.map(roleId => ({ userId, roleId })),
    });
  }
}