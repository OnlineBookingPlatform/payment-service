import { Controller } from '@nestjs/common';
import { ZalopayService } from './zalopay.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ZalopayController {
  constructor(private readonly zalopayService: ZalopayService) {}


  // https://docs.zalopay.vn/v2/start/#B
  @MessagePattern('create_payment')
  async createZaloPayPayment(
    @Payload() data: any,
  ) {
    try {
      const paymentUrl = await this.zalopayService.createPayment(data);
      return paymentUrl;
    } catch (error) {
      console.error('Error creating ZaloPay payment:', error);
      throw new Error('Failed to create ZaloPay payment');
    }
  }
}
