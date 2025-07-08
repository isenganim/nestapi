import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

type EnvSchema = {
  // App
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  FRONTEND_URL: string;
  API_PREFIX: string;

  // Database
  DATABASE_URL: string;

  // JWT
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRATION: string;
  JWT_REFRESH_EXPIRATION: string;

  // OAuth
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;

  // Email
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USERNAME?: string;
  SMTP_PASSWORD?: string;
  SMTP_FROM?: string;

  // Security
  CORS_ORIGIN: string | string[];
  TRUST_PROXY: number;
  SESSION_SECRET: string;
  COOKIE_SECRET: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;

  // Feature Flags
  ENABLE_REGISTRATION: boolean;
  ENABLE_EMAIL_VERIFICATION: boolean;
  ENABLE_RATE_LIMITING: boolean;

  // Logging
  LOG_LEVEL: 'error' | 'warn' | 'log' | 'debug' | 'verbose';
  LOG_FORMAT: 'json' | 'pretty';
};

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService<EnvSchema, true>) {}

  // App
  get nodeEnv() {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get port() {
    return this.configService.get('PORT', { infer: true });
  }

  get frontendUrl() {
    return this.configService.get('FRONTEND_URL', { infer: true });
  }

  get apiPrefix() {
    return this.configService.get('API_PREFIX', { infer: true });
  }

  // Database
  get databaseUrl() {
    return this.configService.get('DATABASE_URL', { infer: true });
  }

  // JWT
  get jwtSecret() {
    return this.configService.get('JWT_SECRET', { infer: true });
  }

  get jwtAccessExpiration() {
    return this.configService.get('JWT_ACCESS_EXPIRATION', { infer: true });
  }

  get jwtRefreshExpiration() {
    return this.configService.get('JWT_REFRESH_EXPIRATION', { infer: true });
  }

  // OAuth
  get googleClientId() {
    return this.configService.get('GOOGLE_CLIENT_ID', { infer: true });
  }

  get googleClientSecret() {
    return this.configService.get('GOOGLE_CLIENT_SECRET', { infer: true });
  }

  get githubClientId() {
    return this.configService.get('GITHUB_CLIENT_ID', { infer: true });
  }

  get githubClientSecret() {
    return this.configService.get('GITHUB_CLIENT_SECRET', { infer: true });
  }

  // Email
  get smtpConfig() {
    return {
      host: this.configService.get('SMTP_HOST', { infer: true }),
      port: this.configService.get('SMTP_PORT', { infer: true }),
      username: this.configService.get('SMTP_USERNAME', { infer: true }),
      password: this.configService.get('SMTP_PASSWORD', { infer: true }),
      from: this.configService.get('SMTP_FROM', { infer: true }),
    };
  }

  // Security
  get corsOrigin() {
    const origin = this.configService.get('CORS_ORIGIN', { infer: true });
    if (typeof origin === 'string') {
      return origin === '*' ? true : origin.split(',').map((o) => o.trim());
    }
    return origin;
  }

  get trustProxy() {
    return this.configService.get('TRUST_PROXY', { infer: true });
  }

  get sessionSecret() {
    return this.configService.get('SESSION_SECRET', { infer: true });
  }

  get cookieSecret() {
    return this.configService.get('COOKIE_SECRET', { infer: true });
  }

  // Rate Limiting
  get rateLimit() {
    return {
      windowMs: this.configService.get('RATE_LIMIT_WINDOW_MS', { infer: true }),
      max: this.configService.get('RATE_LIMIT_MAX', { infer: true }),
    };
  }

  // Feature Flags
  get enableRegistration() {
    return this.configService.get('ENABLE_REGISTRATION', { infer: true });
  }

  get enableEmailVerification() {
    return this.configService.get('ENABLE_EMAIL_VERIFICATION', { infer: true });
  }

  get enableRateLimiting() {
    return this.configService.get('ENABLE_RATE_LIMITING', { infer: true });
  }

  // Logging
  get logLevel() {
    return this.configService.get('LOG_LEVEL', { infer: true });
  }

  get logFormat() {
    return this.configService.get('LOG_FORMAT', { infer: true });
  }

  // Helper methods
  isDevelopment() {
    return this.nodeEnv === 'development';
  }

  isProduction() {
    return this.nodeEnv === 'production';
  }

  isTest() {
    return this.nodeEnv === 'test';
  }
}
