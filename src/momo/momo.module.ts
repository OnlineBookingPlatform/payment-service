import { Module } from '@nestjs/common';
import { MomoController } from './momo.controller';
import { MomoService } from './momo.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionHistory } from 'src/database/transaction_history.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([TransactionHistory])],
  controllers: [MomoController],
  providers: [MomoService],
})
export class MomoModule {}
