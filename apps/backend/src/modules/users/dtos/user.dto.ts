// user.dto.ts - DTOs para usuarios

import { IsEmail, IsString, IsOptional, IsBoolean, MinLength, Matches, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string = '';

  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)| (?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número o carácter especial'})
  password?: string | null = null; // Opcional para Google SSO

  @IsOptional()
  @IsString()
  name?: string | null = null;

  @IsOptional()
  @IsUUID()
  programId?: string | null = null;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  programId?: string | null;
}

export class AssignRolesDto {
  @IsString({ each: true })
  roleIds: string[] = [];
}