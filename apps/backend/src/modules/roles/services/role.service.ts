// role.service.ts - Servicio para gestión de roles

import { prisma } from '../../../prisma';
import { Role } from '../entities/role.entity';
const predefinedRoles = [
  { name: 'ESTUDIANTE', description: 'Estudiante de la universidad' },
  { name: 'PASTOR_TUTOR', description: 'Pastor tutor' },
  { name: 'DOCENTE', description: 'Docente' },
  { name: 'COORDINADOR', description: 'Coordinador' },
  { name: 'DECANO', description: 'Decano' },
  { name: 'ADMIN_TECNICO', description: 'Administrador técnico' },
];

export class RoleService {
  async seedRoles(): Promise<void> {
    for (const role of predefinedRoles) {
      const existing = await prisma.role.findUnique({ where: { name: role.name } });
      if (!existing) {
        await prisma.role.create({ data: role });
      }
    }
  }

  async getAllRoles(): Promise<Role[]> {
    const roles = await prisma.role.findMany();
    return roles as Role[];
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({ where: { name } });
    return role as Role | null;
  }

  async findById(id: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({ where: { id } });
    return role as Role | null;
  }
}