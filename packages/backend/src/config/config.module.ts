import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ConfigService } from './config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
      validationSchema: Joi.object({
        // App
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        FRONTEND_URL: Joi.string().required(),
        API_PREFIX: Joi.string().default('/api/v1'),

        // Database
        DATABASE_URL: Joi.string().required(),

        // JWT
        JWT_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

        // OAuth
        GOOGLE_CLIENT_ID: Joi.string(),
        GOOGLE_CLIENT_SECRET: Joi.string(),
        GITHUB_CLIENT_ID: Joi.string(),
        GITHUB_CLIENT_SECRET: Joi.string(),

        // Email
        SMTP_HOST: Joi.string(),
        SMTP_PORT: Joi.number(),
        SMTP_USERNAME: Joi.string(),
        SMTP_PASSWORD: Joi.string(),
        SMTP_FROM: Joi.string(),

        // Security
        CORS_ORIGIN: Joi.string().default('*'),
        TRUST_PROXY: Joi.number().default(0),
        SESSION_SECRET: Joi.string().required(),
        COOKIE_SECRET: Joi.string().required(),

        // Rate Limiting
        RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
        RATE_LIMIT_MAX: Joi.number().default(100),

        // Feature Flags
        ENABLE_REGISTRATION: Joi.boolean().default(true),
        ENABLE_EMAIL_VERIFICATION: Joi.boolean().default(true),
        ENABLE_RATE_LIMITING: Joi.boolean().default(true),

        // Logging
        LOG_LEVEL: Joi.string()
          .valid('error', 'warn', 'log', 'debug', 'verbose')
          .default('log'),
        LOG_FORMAT: Joi.string().valid('json', 'pretty').default('pretty'),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
