// DTOs para el módulo de Términos Académicos
import { IsString, IsInt, IsDateString, IsOptional, IsIn, Min } from 'class-validator';

export class CreateTermDto {
  @IsString()
  name!: string; // Ejemplo: "2025-1", "2026-2"

  @IsInt()
  @Min(2020)
  academicYear!: number; // Ejemplo: 2025, 2026

  @IsInt()
  @Min(1)
  academicPeriod!: number; // 1 = Primer semestre, 2 = Segundo semestre

  @IsDateString()
  startDate!: string; // Fecha de inicio del período

  @IsDateString()
  endDate!: string; // Fecha de fin del período

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'INACTIVE', 'COMPLETED'])
  status?: string; // Estado del término
}

export class UpdateTermDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(2020)
  academicYear?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  academicPeriod?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'INACTIVE', 'COMPLETED'])
  status?: string;
}
