import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../config/config.service';
import { PrismaClient } from '../../generated/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaClient,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Check if the token is blacklisted
    // Note: Token blacklist check commented out - RevokedToken model not found in schema
    // const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    // const isBlacklisted = await this.prisma.revokedToken.findUnique({
    //   where: { token },
    // });

    // if (isBlacklisted) {
    //   throw new UnauthorizedException('Token has been revoked');
    // }

    // Get the user from the database
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        isLocked: true,
        failedLoginAttempts: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isLocked) {
      throw new UnauthorizedException('Account is locked. Please contact support.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active. Please verify your email.');
    }

    return user;
  }
}
