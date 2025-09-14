// user.service.ts - Servicio para lógica de negocio de usuarios

import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto, UpdateUserDto, AssignRolesDto } from '../dtos/user.dto';
import { User } from '../entities/user.entity';
// Using standard JavaScript Error instead of NestJS BadRequestException
class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

const prisma = new PrismaClient();
const userRepository = new UserRepository();

export class UserService {
  async create(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    }
    if (!createUserDto.email.endsWith('@unac.edu.co')) {
      throw new BadRequestError('El correo debe ser del dominio @unac.edu.co');
    }
    const existingUser = await userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestError('El usuario ya existe');
    }
    return userRepository.create(createUserDto as any);
  }

  async findAll(): Promise<User[]> {
    return userRepository.findAll();
  }

  async findOne(id: string): Promise<User | null> {
    return userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return userRepository.update(id, updateUserDto);
  }

  async assignRoles(userId: string, assignRolesDto: AssignRolesDto): Promise<void> {
    const { roleIds } = assignRolesDto;

    // Validar que el usuario exista
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError('Usuario no encontrado');
    }

    // Validar que todos los roleIds existan
    const existingRoles = await prisma.role.findMany({
      where: { id: { in: roleIds } }
    });
    
    if (existingRoles.length !== roleIds.length) {
      throw new BadRequestError('Uno o más roles no existen');
    }

    // Primero, eliminar los roles actuales del usuario para evitar duplicados
    await prisma.userRole.deleteMany({ where: { userId } });

    // Luego, asignar los nuevos roles
    const userRoleData = roleIds.map(roleId => ({
      userId,
      roleId,
    }));

    await prisma.userRole.createMany({ data: userRoleData });
  }

  async getUserRoles(userId: string): Promise<any[]> {
    const userWithRoles = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!userWithRoles) {
      throw new BadRequestError('Usuario no encontrado');
    }

    return userWithRoles.roles.map(userRole => userRole.role);
  }

  async getUserPermissions(userId: string): Promise<any[]> {
    const userRoles = await this.getUserRoles(userId);
    const permissions = new Map();

    userRoles.forEach(role => {
      role.permissions?.forEach((rolePermission: any) => {
        const permission = rolePermission.permission;
        if (permission && permission.estado === 'ACTIVO') {
          permissions.set(permission.id, permission);
        }
      });
    });

    return Array.from(permissions.values());
  }

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some(permission => permission.nombre === permissionName);
  }

  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some(role => role.nombre === roleName);
  }

  async activateDeactivate(id: string, isActive: boolean): Promise<User> {
    return this.update(id, { isActive });
  }
}