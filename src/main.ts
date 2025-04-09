import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { HttpExceptionFilter } from './utils/http-exceptions.filter';

const PORT = 4003;

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: PORT,
      },
    },
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen();
  console.log(`✅ Payment Service is listening on port ${PORT}`);
}
void bootstrap();
