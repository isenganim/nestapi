import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
// import { LoggerModule } from '@nestjs/pino';

@Module({
  imports: [
    // Core modules
    ConfigModule,
    
    // Database
    PrismaModule,
    
    // Feature modules
    AuthModule,
    UsersModule,
    NotesModule,
    
    // Logger (configured as global)
    // LoggerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     pinoHttp: {
    //       level: config.logLevel,
    //       transport: {
    //         target: 'pino-pretty',
    //         options: {
    //           colorize: config.logFormat === 'pretty',
    //           translateTime: 'yyyy-mm-dd HH:MM:ss Z',
    //           ignore: 'pid,hostname,context,req,res,responseTime',
    //           messageFormat: '{msg} {req.method} {req.url} {res.statusCode}',
    //         },
    //       },
    //     },
    //   }),
    // }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
