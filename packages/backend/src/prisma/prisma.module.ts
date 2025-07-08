import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '../generated/client';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    {
      provide: PrismaClient,
      useFactory: (config: ConfigService) => {
        const client = new PrismaClient({
          log: [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'event' },
            { level: 'info', emit: 'event' },
            { level: 'warn', emit: 'event' },
          ],
        });
        
        // Enable logging in development
        if (config.isDevelopment()) {
          client.$on('query', (e) => {
            console.log('Query: ' + e.query);
            console.log('Params: ' + e.params);
            console.log('Duration: ' + e.duration + 'ms');
          });
        }
        
        client.$on('error', (e) => {
          console.error('Prisma Error:', e);
        });
        
        return client;
      },
      inject: [ConfigService],
    },
    {
      provide: 'PRISMA_CLIENT',
      useExisting: PrismaClient,
    },
  ],
  exports: [PrismaService, PrismaClient, 'PRISMA_CLIENT'],
})
export class PrismaModule {}
