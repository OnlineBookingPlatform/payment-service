import { Module } from '@nestjs/common';
import { VnpayController } from './vnpay.controller';
import { VnpayService } from './vnpay.service';

@Module({
  imports: [],
  controllers: [VnpayController],
  providers: [VnpayService],
})
export class VnpayModule {}
