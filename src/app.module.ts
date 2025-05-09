import { Module, OnModuleInit } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';
import { EnvironmentModule } from './config/config.module';
import { DatabaseModule } from './config/database.module';
import { DataSource } from 'typeorm';
import { VnpayModule } from './vnpay/vnpay.module';
import { MomoModule } from './momo/momo.module';
import { ZalopayModule } from './zalopay/zalopay.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    DatabaseModule,
    EnvironmentModule,
    PaymentModule,
    VnpayModule,
    MomoModule,
    ZalopayModule,
    TransactionModule
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
