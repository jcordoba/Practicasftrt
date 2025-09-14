// permission.dto.ts - DTOs para permisos

import { IsString, IsOptional, IsIn } from 'class-validator';

const MODULOS_VALIDOS = [
  'PRACTICAS',
  'ASIGNACIONES', 
  'EVALUACIONES',
  'EVIDENCIAS',
  'REPORTES',
  'USUARIOS',
  'ADMINISTRACION',
  'DASHBOARD'
];

const ACCIONES_VALIDAS = [
  'read',
  'create',
  'update',
  'delete',
  'export',
  'manage',
  'configure',
  'assign_roles'
];

export class CreatePermissionDto {
  @IsString()
  nombre: string = '';

  @IsString()
  descripcion: string = '';

  @IsString()
  @IsIn(MODULOS_VALIDOS, { message: 'Módulo no válido' })
  modulo: string = '';

  @IsString()
  @IsIn(ACCIONES_VALIDAS, { message: 'Acción no válida' })
  accion: string = '';
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @IsIn(MODULOS_VALIDOS, { message: 'Módulo no válido' })
  modulo?: string;

  @IsOptional()
  @IsString()
  @IsIn(ACCIONES_VALIDAS, { message: 'Acción no válida' })
  accion?: string;
}

export class AssignPermissionsToRoleDto {
  @IsString({ each: true })
  permissionIds: string[] = [];
}