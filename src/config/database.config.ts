// import {
//   TypeOrmModuleOptions,
//   TypeOrmModuleAsyncOptions,
// } from '@nestjs/typeorm';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { Payment } from '../payment/entities/payment.entity'; // or your entity paths

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
//   imports: [ConfigModule],
//   inject: [ConfigService],
//   useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
//     type: 'mongodb',
//     // trong file .env
//     url: configService.get<string>('MONGO_URI'),
//     synchronize: true,
//     entities: [Payment],
//   }),
// };

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  username: 'postgres.ubqqfqlhesajpvqdkeui',
  password: '0397892603',
  database: 'postgres',
  autoLoadEntities: true,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: false,
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};
