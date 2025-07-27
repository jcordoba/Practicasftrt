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
    if (createUserDto.programId) {
      // TODO: Validar existencia real del programa en base de datos
    }
    return userRepository.create(createUserDto as any);
  }

  async findAll(filter?: { programId?: string }): Promise<User[]> {
    return userRepository.findAll(filter);
  }

  async findOne(id: string): Promise<User | null> {
    return userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.programId) {
      // TODO: Validar existencia real del programa en base de datos
    }
    return userRepository.update(id, updateUserDto);
  }

  async assignRoles(userId: string, assignRolesDto: AssignRolesDto): Promise<void> {
    // TODO: Validar que los roleIds existan
    const { roleIds } = assignRolesDto;

    // Primero, eliminar los roles actuales del usuario para evitar duplicados
    await prisma.userRole.deleteMany({ where: { userId } });

    // Luego, asignar los nuevos roles
    const userRoleData = roleIds.map(roleId => ({
      userId,
      roleId,
    }));

    await prisma.userRole.createMany({ data: userRoleData });
  }

  async activateDeactivate(id: string, isActive: boolean): Promise<User> {
    return this.update(id, { isActive });
  }
}