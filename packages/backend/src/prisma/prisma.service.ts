import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/client';
import { ConfigService } from '../config/config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private config: ConfigService) {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });

    // Enable logging in development
    // Note: Event listeners commented out due to generated client compatibility
    // if (config.isDevelopment()) {
    //   this.$on('query', (e) => {
    //     console.log('Query: ' + e.query);
    //     console.log('Params: ' + e.params);
    //     console.log('Duration: ' + e.duration + 'ms');
    //   });
    // }

    // this.$on('error', (e) => {
    //   console.error('Prisma Error:', e);
    // });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}