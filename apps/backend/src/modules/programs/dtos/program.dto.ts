import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateProgramDto {
  @IsString()
  name: string = '';

  @IsString()
  code: string = '';

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateProgramDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;
}