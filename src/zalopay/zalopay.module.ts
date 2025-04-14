import { Module } from '@nestjs/common';
import { ZalopayController } from './zalopay.controller';
import { ZalopayService } from './zalopay.service';

@Module({
  imports: [],
  controllers: [ZalopayController],
  providers: [ZalopayService],
  exports: [],
})
export class ZalopayModule {}
