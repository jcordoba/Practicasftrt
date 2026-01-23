// DTOs para el módulo de Asignaciones (Placements)
import { IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreatePlacementDto {
  @IsString()
  studentId!: string;

  @IsString()
  centerId!: string;

  @IsString()
  termId!: string;

  @IsOptional()
  @IsString()
  tutorId?: string; // Pastor tutor

  @IsOptional()
  @IsString()
  teacherId?: string; // Docente supervisor

  @IsOptional()
  @IsString()
  programId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'COMPLETED', 'CANCELLED', 'PENDING'])
  status?: string;
}

export class UpdatePlacementDto {
  @IsOptional()
  @IsString()
  centerId?: string;

  @IsOptional()
  @IsString()
  tutorId?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  programId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'COMPLETED', 'CANCELLED', 'PENDING'])
  status?: string;
}
