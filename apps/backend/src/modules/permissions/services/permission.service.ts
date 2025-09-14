// permission.service.ts - Servicio para gestión de permisos

import { PrismaClient } from '@prisma/client';
import { CreatePermissionDto, UpdatePermissionDto } from '../dtos/permission.dto';
import { Permission } from '../entities/permission.entity';

const prisma = new PrismaClient();

export class PermissionService {
  async getAllPermissions(): Promise<Permission[]> {
    const permissions = await prisma.permission.findMany({
      where: { estado: 'ACTIVO' },
      orderBy: [{ modulo: 'asc' }, { nombre: 'asc' }]
    });
    return permissions.map(p => new Permission(p));
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    const permission = await prisma.permission.findUnique({
      where: { id, estado: 'ACTIVO' }
    });
    return permission ? new Permission(permission) : null;
  }

  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const permission = await prisma.permission.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        modulo: dto.modulo,
        accion: dto.accion,
        estado: 'ACTIVO'
      }
    });
    return new Permission(permission);
  }

  async updatePermission(id: string, dto: UpdatePermissionDto): Promise<Permission | null> {
    const permission = await prisma.permission.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        modulo: dto.modulo,
        accion: dto.accion,
        fecha_actualizacion: new Date()
      }
    });
    return new Permission(permission);
  }

  async deletePermission(id: string): Promise<boolean> {
    await prisma.permission.update({
      where: { id },
      data: { estado: 'INACTIVO' }
    });
    return true;
  }

  async getPermissionsByModule(modulo: string): Promise<Permission[]> {
    const permissions = await prisma.permission.findMany({
      where: { modulo, estado: 'ACTIVO' },
      orderBy: { nombre: 'asc' }
    });
    return permissions.map(p => new Permission(p));
  }

  async seedPermissions(): Promise<void> {
    const defaultPermissions = [
      // Módulo Prácticas
      { nombre: 'VER_PRACTICAS', descripcion: 'Ver prácticas asignadas', modulo: 'PRACTICAS', accion: 'READ' },
      { nombre: 'CREAR_PRACTICAS', descripcion: 'Crear nuevas prácticas', modulo: 'PRACTICAS', accion: 'create' },
      { nombre: 'EDITAR_PRACTICAS', descripcion: 'Editar prácticas existentes', modulo: 'PRACTICAS', accion: 'update' },
      { nombre: 'ELIMINAR_PRACTICAS', descripcion: 'Eliminar prácticas', modulo: 'PRACTICAS', accion: 'delete' },
      
      // Módulo Asignaciones
      { nombre: 'VER_ASIGNACIONES', descripcion: 'Ver asignaciones', modulo: 'ASIGNACIONES', accion: 'read' },
      { nombre: 'CREAR_ASIGNACIONES', descripcion: 'Crear asignaciones', modulo: 'ASIGNACIONES', accion: 'create' },
      { nombre: 'GESTIONAR_TRASLADOS', descripcion: 'Gestionar traslados de estudiantes', modulo: 'ASIGNACIONES', accion: 'update' },
      
      // Módulo Evaluaciones
      { nombre: 'VER_EVALUACIONES', descripcion: 'Ver evaluaciones', modulo: 'EVALUACIONES', accion: 'read' },
      { nombre: 'CREAR_EVALUACIONES', descripcion: 'Crear evaluaciones', modulo: 'EVALUACIONES', accion: 'create' },
      { nombre: 'EDITAR_EVALUACIONES', descripcion: 'Editar evaluaciones', modulo: 'EVALUACIONES', accion: 'update' },
      
      // Módulo Evidencias
      { nombre: 'VER_EVIDENCIAS', descripcion: 'Ver evidencias', modulo: 'EVIDENCIAS', accion: 'read' },
      { nombre: 'SUBIR_EVIDENCIAS', descripcion: 'Subir evidencias', modulo: 'EVIDENCIAS', accion: 'create' },
      { nombre: 'VALIDAR_EVIDENCIAS', descripcion: 'Validar evidencias', modulo: 'EVIDENCIAS', accion: 'update' },
      
      // Módulo Reportes
      { nombre: 'VER_REPORTES', descripcion: 'Ver reportes', modulo: 'REPORTES', accion: 'read' },
      { nombre: 'GENERAR_REPORTES', descripcion: 'Generar reportes', modulo: 'REPORTES', accion: 'create' },
      { nombre: 'EXPORTAR_REPORTES', descripcion: 'Exportar reportes', modulo: 'REPORTES', accion: 'export' },
      
      // Módulo Usuarios
      { nombre: 'VER_USUARIOS', descripcion: 'Ver usuarios', modulo: 'USUARIOS', accion: 'read' },
      { nombre: 'CREAR_USUARIOS', descripcion: 'Crear usuarios', modulo: 'USUARIOS', accion: 'create' },
      { nombre: 'EDITAR_USUARIOS', descripcion: 'Editar usuarios', modulo: 'USUARIOS', accion: 'update' },
      { nombre: 'ASIGNAR_ROLES', descripcion: 'Asignar roles a usuarios', modulo: 'USUARIOS', accion: 'assign_roles' },
      
      // Módulo Administración
      { nombre: 'GESTIONAR_CENTROS', descripcion: 'Gestionar centros de práctica', modulo: 'ADMINISTRACION', accion: 'manage' },
      { nombre: 'GESTIONAR_ORGANIZACION', descripcion: 'Gestionar estructura organizacional', modulo: 'ADMINISTRACION', accion: 'manage' },
      { nombre: 'CONFIGURAR_SISTEMA', descripcion: 'Configurar parámetros del sistema', modulo: 'ADMINISTRACION', accion: 'configure' },
      { nombre: 'VER_LOGS', descripcion: 'Ver logs del sistema', modulo: 'ADMINISTRACION', accion: 'read' },
      
      // Módulo Dashboard
      { nombre: 'VER_DASHBOARD', descripcion: 'Ver dashboard', modulo: 'DASHBOARD', accion: 'read' },
      { nombre: 'VER_INDICADORES', descripcion: 'Ver indicadores y métricas', modulo: 'DASHBOARD', accion: 'read' }
    ];

    for (const permissionData of defaultPermissions) {
      await prisma.permission.upsert({
        where: { nombre: permissionData.nombre },
        update: {},
        create: {
          ...permissionData,
          estado: 'ACTIVO'
        }
      });
    }
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        estado: 'ACTIVO'
      },
      include: {
        role: {
          include: {
            permissions: {
              where: { estado: 'ACTIVO' },
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    const permissions = new Set<string>();
    userRoles.forEach(userRole => {
      userRole.role.permissions.forEach(rolePermission => {
        permissions.add(rolePermission.permission.nombre);
      });
    });

    return Array.from(permissions);
  }

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.includes(permissionName);
  }

  async hasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissionNames.some(permission => userPermissions.includes(permission));
  }
}