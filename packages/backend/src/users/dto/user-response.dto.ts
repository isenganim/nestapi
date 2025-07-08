import { ApiProperty } from '@nestjs/swagger';
import { User, UserRole, UserStatus } from '../../generated/client';

export class UserResponseDto {
  @ApiProperty({ description: 'Unique identifier for the user' })
  id: string;

  @ApiProperty({ description: 'User\'s email address' })
  email: string;

  @ApiProperty({ description: 'User\'s full name' })
  name: string;

  @ApiProperty({ description: 'URL to the user\'s avatar image', required: false })
  avatar?: string;

  @ApiProperty({ enum: UserRole, description: 'User\'s role in the system' })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, description: 'Current status of the user account' })
  status: UserStatus;

  @ApiProperty({ description: 'Whether the user has verified their email', default: false })
  isEmailVerified: boolean;

  @ApiProperty({ type: Date, description: 'When the user last logged in', required: false })
  lastLogin?: Date;

  @ApiProperty({ type: Date, description: 'When the user account was created' })
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'When the user account was last updated' })
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.avatar = user.avatar || undefined;
    this.role = user.role;
    this.status = user.status;
    this.isEmailVerified = user.emailVerified;
    this.lastLogin = user.lastLogin || undefined;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
