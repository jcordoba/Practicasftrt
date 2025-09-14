// role.service.ts - Servicio para gestión de roles

import { PrismaClient } from '@prisma/client';
import { Role } from '../entities/role.entity';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from '../dtos/role.dto';

const prisma = new PrismaClient();

const predefinedRoles = [
  { nombre: 'ESTUDIANTE', descripcion: 'Usuario que realiza la práctica' },
  { nombre: 'PASTOR_TUTOR', descripcion: 'Supervisor de estudiantes en centros de práctica' },
  { nombre: 'DOCENTE_PRACTICA', descripcion: 'Profesor a cargo del seguimiento académico' },
  { nombre: 'COORDINADOR', descripcion: 'Responsable general del proceso de prácticas' },
  { nombre: 'DECANO', descripcion: 'Directivo superior, visión global' },
  { nombre: 'ADMIN_TECNICO', descripcion: 'Encargado de infraestructura y soporte' },
];

// Definición de permisos por rol según especificaciones
const rolePermissions = {
  'ESTUDIANTE': [
    'VER_PRACTICAS', 'VER_ASIGNACIONES', 'VER_EVALUACIONES', 'VER_EVIDENCIAS',
    'SUBIR_EVIDENCIAS', 'VER_DASHBOARD'
  ],
  'PASTOR_TUTOR': [
    'VER_PRACTICAS', 'VER_ASIGNACIONES', 'VER_EVALUACIONES', 'VER_EVIDENCIAS',
    'CREAR_EVALUACIONES', 'VALIDAR_EVIDENCIAS', 'VER_DASHBOARD'
  ],
  'DOCENTE_PRACTICA': [
    'VER_PRACTICAS', 'CREAR_PRACTICAS', 'EDITAR_PRACTICAS',
    'VER_ASIGNACIONES', 'CREAR_ASIGNACIONES', 'GESTIONAR_TRASLADOS',
    'VER_EVALUACIONES', 'CREAR_EVALUACIONES', 'EDITAR_EVALUACIONES',
    'VER_EVIDENCIAS', 'VALIDAR_EVIDENCIAS',
    'VER_REPORTES', 'GENERAR_REPORTES', 'EXPORTAR_REPORTES',
    'VER_DASHBOARD'
  ],
  'COORDINADOR': [
    'VER_PRACTICAS', 'CREAR_PRACTICAS', 'EDITAR_PRACTICAS', 'ELIMINAR_PRACTICAS',
    'VER_ASIGNACIONES', 'CREAR_ASIGNACIONES', 'GESTIONAR_TRASLADOS',
    'VER_EVALUACIONES', 'CREAR_EVALUACIONES', 'EDITAR_EVALUACIONES',
    'VER_EVIDENCIAS', 'VALIDAR_EVIDENCIAS',
    'VER_REPORTES', 'GENERAR_REPORTES', 'EXPORTAR_REPORTES',
    'VER_USUARIOS', 'CREAR_USUARIOS', 'EDITAR_USUARIOS', 'ASIGNAR_ROLES',
    'GESTIONAR_CENTROS', 'GESTIONAR_ORGANIZACION',
    'VER_DASHBOARD', 'VER_INDICADORES'
  ],
  'DECANO': [
    'VER_REPORTES', 'VER_INDICADORES', 'VER_DASHBOARD'
  ],
  'ADMIN_TECNICO': [
    'VER_USUARIOS', 'CREAR_USUARIOS', 'EDITAR_USUARIOS', 'ASIGNAR_ROLES',
    'GESTIONAR_CENTROS', 'GESTIONAR_ORGANIZACION', 'CONFIGURAR_SISTEMA',
    'VER_LOGS', 'VER_DASHBOARD'
  ]
};

export class RoleService {
  async getAllRoles(): Promise<Role[]> {
    const roles = await prisma.role.findMany({
      where: { estado: 'ACTIVO' },
      include: {
        permissions: {
          where: { estado: 'ACTIVO' },
          include: {
            permission: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });
    return roles.map(r => new Role(r));
  }

  async getRoleById(id: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { id, estado: 'ACTIVO' },
      include: {
        permissions: {
          where: { estado: 'ACTIVO' },
          include: {
            permission: true
          }
        }
      }
    });
    return role ? new Role(role) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { nombre: name, estado: 'ACTIVO' },
      include: {
        permissions: {
          where: { estado: 'ACTIVO' },
          include: {
            permission: true
          }
        }
      }
    });
    return role ? new Role(role) : null;
  }

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const role = await prisma.role.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        estado: 'ACTIVO'
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    return new Role(role);
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role | null> {
    const role = await prisma.role.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        fecha_actualizacion: new Date()
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    return new Role(role);
  }

  async deleteRole(id: string): Promise<boolean> {
    await prisma.role.update({
      where: { id },
      data: { estado: 'INACTIVO' }
    });
    return true;
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<Role | null> {
    // Eliminar permisos existentes
    await prisma.rolePermission.updateMany({
      where: { roleId },
      data: { estado: 'INACTIVO' }
    });

    // Asignar nuevos permisos
    for (const permissionId of permissionIds) {
      await prisma.rolePermission.create({
        data: {
          roleId,
          permissionId,
          estado: 'ACTIVO',
          fecha_asignacion: new Date()
        }
      });
    }

    return this.getRoleById(roleId);
  }

  async seedRoles(): Promise<void> {
    for (const roleData of predefinedRoles) {
      const existingRole = await prisma.role.findUnique({
        where: { nombre: roleData.nombre }
      });

      let role;
      if (!existingRole) {
        role = await prisma.role.create({
          data: {
            ...roleData,
            estado: 'ACTIVO'
          }
        });
      } else {
        role = existingRole;
      }

      // Asignar permisos predefinidos
      const permissionNames = rolePermissions[roleData.nombre as keyof typeof rolePermissions] || [];
      
      for (const permissionName of permissionNames) {
        const permission = await prisma.permission.findUnique({
          where: { nombre: permissionName }
        });

        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id
              }
            },
            update: {
              estado: 'ACTIVO',
              fecha_asignacion: new Date()
            },
            create: {
              roleId: role.id,
              permissionId: permission.id,
              estado: 'ACTIVO',
              fecha_asignacion: new Date()
            }
          });
        }
      }
    }
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        roleId,
        estado: 'ACTIVO'
      },
      include: {
        permission: true
      }
    });

    return rolePermissions.map(rp => rp.permission.nombre);
  }
}