import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, User, UserRole, UserStatus } from '../generated/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaClient) {}

  private toUserResponse(user: User): UserResponseDto {
    return new UserResponseDto(user);
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await argon2.hash(createUserDto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        avatar: createUserDto.avatar,
        role: createUserDto.role || UserRole.USER,
        status: createUserDto.status || UserStatus.ACTIVE,
      },
    });

    return this.toUserResponse(user);
  }

  async findAll(limit = 10, offset = 0): Promise<{ users: UserResponseDto[]; total: number }> {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users: users.map((user) => this.toUserResponse(user)),
      total,
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser?: User): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if current user is authorized to update this user
    if (currentUser && currentUser.id !== id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not authorized to update this user');
    }

    // If updating password, verify current password
    if (updateUserDto.newPassword) {
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException('Current password is required to update password');
      }

      const isPasswordValid = await argon2.verify(
        user.password,
        updateUserDto.currentPassword,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash new password
      updateUserDto.password = await argon2.hash(updateUserDto.newPassword);
    }

    // Prevent role escalation for non-admin users
    if (updateUserDto.role && currentUser?.role !== UserRole.ADMIN) {
      delete updateUserDto.role;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        email: updateUserDto.email,
        name: updateUserDto.name,
        avatar: updateUserDto.avatar,
        ...(updateUserDto.password && { password: updateUserDto.password }),
        ...(currentUser?.role === UserRole.ADMIN && {
          role: updateUserDto.role,
          status: updateUserDto.status,
        }),
      },
    });

    return this.toUserResponse(updatedUser);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent users from deleting themselves or admins
    if (user.id === currentUser.id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    if (user.role === UserRole.ADMIN && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not authorized to delete an admin user');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        status: UserStatus.ACTIVE,
      },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
      },
    });
  }

  async requestPasswordReset(email: string): Promise<{ token: string }> {
    const user = await this.findByEmail(email);
    if (!user) {
      // Don't reveal that the email doesn't exist
      return { token: '' };
    }

    // Generate reset token (in a real app, you'd generate a secure token and send an email)
    const token = 'reset-token-' + Math.random().toString(36).substring(2, 15);
    
    // Store reset token in database with expiration
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      },
    });

    // In a real app, you would send an email with the reset link
    console.log(`Password reset token for ${email}: ${token}`);

    return { token };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find the reset token
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update user's password
    const hashedPassword = await argon2.hash(newPassword);
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });
  }
}
