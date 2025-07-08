import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { json, urlencoded } from 'express';
// import { Logger } from 'nestjs-pino';

async function bootstrap() {
  // Create the app with logger
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  // const logger = app.get(Logger);
  
  // Use logger
  // app.useLogger(logger);
  
  // Set API prefix
  app.setGlobalPrefix(config.apiPrefix);
  
  // Enable CORS
  app.enableCors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'X-XSRF-TOKEN',
    ],
  });
  
  // Security middlewares
  app.use(helmet());
  app.use(compression());
  
  // Body parsing
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  
  // Cookie parser
  app.use(cookieParser(config.cookieSecret));
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Trust proxy
  if (config.trustProxy > 0) {
    app.getHttpAdapter().getInstance().set('trust proxy', config.trustProxy);
  }
  
  // Swagger documentation
  if (config.isDevelopment()) {
    const options = new DocumentBuilder()
      .setTitle('PKM SaaS API')
      .setDescription(`
        Personal Knowledge Management API documentation
        
        ## Authentication
        This API uses JWT tokens for authentication. To access protected endpoints:
        1. Register a new account or login with existing credentials
        2. Use the returned access token in the Authorization header: \`Bearer <token>\`
        3. Refresh tokens when they expire using the refresh endpoint
        
        ## Features
        - **User Management**: Registration, login, profile management
        - **Notes**: Create, read, update, delete notes with markdown support
        - **Tags**: Organize notes with tags
        - **Search**: Full-text search across notes
        - **Pagination**: All list endpoints support pagination
        
        ## Database Seeding
        For development, you can seed the database with sample data:
        \`\`\`bash
        npm run seed
        \`\`\`
      `)
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        },
        'access-token',
      )
      .addTag('auth', 'Authentication endpoints')
      .addTag('notes', 'Note management endpoints')
      .addServer(`http://localhost:${config.port}`, 'Development server')
      .build();
    
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api/v1/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'method',
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
      },
      customSiteTitle: 'PKM SaaS API Documentation',
    });
  }
  
  // Start the application
  await app.listen(config.port, '0.0.0.0');
  
  // Log application startup
  console.log(
    `Application is running on: http://localhost:${config.port}${config.apiPrefix}`,
  );
  
  if (config.isDevelopment()) {
    console.log(`Swagger docs available at: http://localhost:${config.port}/api/v1/docs`);
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
