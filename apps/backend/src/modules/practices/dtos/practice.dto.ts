import { IsString, IsOptional, IsDateString, IsEnum, IsInt, Min } from 'class-validator';
import { PracticeStatus } from '@prisma/client';

export class CreatePracticeDto {
  @IsString()
  name: string = '';

  @IsString()
  description: string = '';

  @IsString()
  studentId: string = '';

  @IsString()
  @IsOptional()
  tutorId?: string;

  @IsString()
  @IsOptional()
  teacherId?: string;

  @IsString()
  institution: string = '';

  @IsDateString()
  startDate: Date = new Date();

  @IsDateString()
  endDate: Date = new Date();

  @IsEnum(PracticeStatus)
  @IsOptional()
  status?: PracticeStatus;

  @IsInt()
  @Min(1)
  hours: number = 0;
}

export class UpdatePracticeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  institution?: string;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsEnum(PracticeStatus)
  @IsOptional()
  status?: PracticeStatus;

  @IsInt()
  @Min(1)
  @IsOptional()
  hours?: number;
}
