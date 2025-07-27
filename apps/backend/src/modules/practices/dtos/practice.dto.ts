import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreatePracticeDto {
  @IsString()
  name: string = '';

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  programId?: string;
}

export class UpdatePracticeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  programId?: string;
}