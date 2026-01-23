// DTOs para el módulo de Centros de Práctica
import { IsString, IsOptional, IsInt, IsEmail, Min, IsIn } from 'class-validator';

export class CreateCenterDto {
  @IsString()
  nombre!: string;

  @IsString()
  @IsIn(['congregacion', 'institucion'], {
    message: 'El tipo debe ser "congregacion" o "institucion"',
  })
  tipo!: string;

  @IsOptional()
  @IsString()
  congregationId?: string;

  @IsOptional()
  @IsString()
  institutionId?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  correoContacto?: string;

  @IsOptional()
  @IsString()
  nombreContacto?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacidadMaxima?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class UpdateCenterDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsIn(['congregacion', 'institucion'])
  tipo?: string;

  @IsOptional()
  @IsString()
  congregationId?: string;

  @IsOptional()
  @IsString()
  institutionId?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  correoContacto?: string;

  @IsOptional()
  @IsString()
  nombreContacto?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacidadMaxima?: number;

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
