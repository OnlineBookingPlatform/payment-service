import {
  TypeOrmModuleOptions,
  TypeOrmModuleAsyncOptions,
} from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Payment } from '../payment/entities/payment.entity'; // or your entity paths

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'mongodb',
    // trong file .env
    url: configService.get<string>('MONGO_URI'),
    synchronize: true,
    entities: [Payment],
  }),
};
