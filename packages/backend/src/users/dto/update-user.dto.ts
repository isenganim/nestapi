import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '../../generated/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Current password must be a string' })
  @IsOptional()
  currentPassword?: string;

  @IsString({ message: 'New password must be a string' })
  @IsOptional()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    {
      message:
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  newPassword?: string;

  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Avatar must be a string' })
  @IsOptional()
  avatar?: string;

  @IsEnum(UserRole, { message: 'Invalid user role' })
  @IsOptional()
  role?: UserRole;

  @IsEnum(UserStatus, { message: 'Invalid user status' })
  @IsOptional()
  status?: UserStatus;
}
