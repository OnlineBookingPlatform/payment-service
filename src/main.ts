import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { HttpExceptionFilter } from './utils/http-exceptions.filter';

async function bootstrap() {
  const PORT = 4003;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: PORT,
      },
    },
  );
  // app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen();
  console.log(`✅ Payment Service is listening on port ${PORT}`);
}
void bootstrap();
