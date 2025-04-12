import { Module, OnModuleInit } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentModule } from './config/config.module';
import { typeOrmConfig } from './config/database.config';
import { DatabaseModule } from './config/database.module';
import { DataSource } from 'typeorm';
import { VnpayModule } from './vnpay/vnpay.module';

@Module({
  imports: [
    DatabaseModule,
    EnvironmentModule,
    PaymentModule,
    VnpayModule
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      console.log('✅ Kết nối PostgreSQL thành công!');
    } else {
      console.error('❌ Kết nối PostgreSQL thất bại!');
    }
  }
}
