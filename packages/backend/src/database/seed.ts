import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  const seederService = app.get(SeederService);

  try {
    const result = await seederService.seedAll();
    console.log('\n🎉 Seeding Summary:');
    console.log(`   Users: ${result.users}`);
    console.log(`   Tags: ${result.tags}`);
    console.log(`   Notes: ${result.notes}`);
    console.log(`   ${result.message}\n`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});