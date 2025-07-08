import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { PrismaClient, User, UserRole } from '../generated/client';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // Check if user is locked
    if (user.isLocked) {
      throw new ForbiddenException('Account is locked. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      // Increment failed login attempts
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: user.failedLoginAttempts + 1,
          isLocked: user.failedLoginAttempts + 1 >= 5, // Lock after 5 failed attempts
        },
      });

      return null;
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lastLogin: new Date(),
        },
      });
    }

    return user;
  }

  async login(loginDto: LoginDto, userAgent: string, ipAddress: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.generateTokens(user, userAgent, ipAddress);
  }

  async register(registerDto: RegisterDto, userAgent: string, ipAddress: string) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ForbiddenException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await argon2.hash(registerDto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        avatar: registerDto.avatar,
        role: UserRole.USER,
        status: this.config.enableEmailVerification ? 'PENDING' : 'ACTIVE',
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user, userAgent, ipAddress);

    // Send verification email if enabled
    if (this.config.enableEmailVerification) {
      await this.sendVerificationEmail(user);
    }

    return tokens;
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto, userAgent: string, ipAddress: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.config.jwtSecret,
      });

      // Find the refresh token in the database
      const token = await this.prisma.refreshToken.findUnique({
        where: { token: payload.jti },
        include: { user: true },
      });

      if (!token || token.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if token is expired
      if (token.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Generate new tokens
      const result = await this.generateTokens(token.user, userAgent, ipAddress);
      
      // Return refresh response format (without user info)
      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenType: result.tokenType,
        expiresIn: result.expiresIn,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      // Verify and decode the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.jwtSecret,
      });

      // Delete the refresh token from the database
      await this.prisma.refreshToken.deleteMany({
        where: { token: payload.jti },
      });

      return { message: 'Successfully logged out' };
    } catch (error) {
      // If token is invalid, just return success
      return { message: 'Successfully logged out' };
    }
  }

  private async generateTokens(user: User, userAgent: string, ipAddress: string) {
    // Generate JWT tokens
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      {
        expiresIn: this.config.jwtAccessExpiration,
      },
    );

    const refreshTokenId = uuidv4();
    const refreshToken = this.jwtService.sign(
      {},
      {
        jwtid: refreshTokenId,
        expiresIn: this.config.jwtRefreshExpiration,
      },
    );

    // Calculate expiration date
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setSeconds(
      refreshTokenExpires.getSeconds() +
        this.parseJwtExpiration(this.config.jwtRefreshExpiration),
    );

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        token: refreshTokenId,
        userId: user.id,
        expiresAt: refreshTokenExpires,
      },
    });

    // Map user to response format
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      isActive: user.status === 'ACTIVE',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.parseJwtExpiration(this.config.jwtAccessExpiration),
      user: userResponse,
    };
  }

  private parseJwtExpiration(expiration: string): number {
    const value = parseInt(expiration, 10);
    if (expiration.endsWith('s')) return value * 1000; // seconds to ms
    if (expiration.endsWith('m')) return value * 60 * 1000; // minutes to ms
    if (expiration.endsWith('h')) return value * 60 * 60 * 1000; // hours to ms
    if (expiration.endsWith('d')) return value * 24 * 60 * 60 * 1000; // days to ms
    return value; // default to ms
  }

  private async sendVerificationEmail(user: User) {
    // Implementation for sending verification email
    // This would typically use a mail service like Nodemailer
    console.log(`Sending verification email to ${user.email}`);
  }
}
