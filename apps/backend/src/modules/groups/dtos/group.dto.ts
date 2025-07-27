import { IsString, IsNotEmpty, IsArray, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string = '';

  @IsString()
  @IsNotEmpty()
  semester: string = '';

  @IsUUID()
  @IsNotEmpty()
  teacherId: string = '';

  @IsArray()
  @IsUUID('all', { each: true })
  students: string[] = [];

  @IsString()
  @IsNotEmpty()
  practiceCenter: string = '';

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  semester?: string;

  @IsUUID()
  @IsOptional()
  teacherId?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  students?: string[];

  @IsString()
  @IsOptional()
  practiceCenter?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}