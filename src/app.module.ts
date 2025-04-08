import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentModule } from './config/config.module';
import { typeOrmConfig } from './config/database.config';

@Module({
  imports: [
    EnvironmentModule,
    TypeOrmModule.forRootAsync(typeOrmConfig),
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
