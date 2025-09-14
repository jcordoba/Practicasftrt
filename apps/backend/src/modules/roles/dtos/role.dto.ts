// role.dto.ts - DTOs para roles

import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  nombre: string = '';

  @IsString()
  descripcion: string = '';
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class AssignPermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissionIds: string[] = [];
}