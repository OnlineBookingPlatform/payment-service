import { Module } from '@nestjs/common';
import { ZalopayController } from './zalopay.controller';
import { ZalopayService } from './zalopay.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionHistory } from 'src/transaction/transaction_history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionHistory])],
  controllers: [ZalopayController],
  providers: [ZalopayService],
  exports: [],
})
export class ZalopayModule {}
