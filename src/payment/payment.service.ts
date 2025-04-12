import { Injectable } from '@nestjs/common';
// import { CreatePaymentDto } from './dto/create-payment.dto';
// import { UpdatePaymentDto } from './dto/update-payment.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Payment } from './entities/payment.entity';
// import { MongoRepository } from 'typeorm';

@Injectable()
export class PaymentService {
  // constructor(
  //   @InjectRepository(Payment)
  //   private paymentRepository: MongoRepository<Payment>,
  // ) {}

  // async create(createPaymentDto: CreatePaymentDto) {
  //   const payment = this.paymentRepository.create(createPaymentDto);
  //   return this.paymentRepository.save(payment);
  // }

  // async findAll(): Promise<Payment[]> {
  //   return this.paymentRepository.find();
  // }

  // async findOne(_id: string): Promise<Payment | null> {
  //   return this.paymentRepository.findOne({ where: { _id } });
  // }

  // async update(_id: string, updatePaymentDto: UpdatePaymentDto) {
  //   await this.paymentRepository.update(_id, updatePaymentDto);
  //   return this.findOne(_id);
  // }

  // async remove(_id: string) {
  //   return this.paymentRepository.delete(_id);
  // }


  createPaymentUrl(data: any) {
    console.log('Received data:', data);
    return null;
  }
}
