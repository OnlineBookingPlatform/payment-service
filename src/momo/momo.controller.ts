import { Controller } from '@nestjs/common';
import { MomoService } from './momo.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class MomoController {
  constructor(private readonly momoService: MomoService) {}

  @MessagePattern('create_momo_payment')
  async createMoMoPayment(data: { amount: number; orderInfo: string }) {
    try {
        const response = await this.momoService.createMoMoPayment(data.amount, data.orderInfo);
        console.log('MoMo payment response:', response);
    } catch (error) {
      console.error('Error creating MoMo payment:', error);
    }
  }

  // Xử lý callback redirect từ MoMo
  @MessagePattern('momo_callback')
  async momoCallback(query: any) {
    return this.momoService.momoCallback(query);
  }

  // Xử lý IPN (thông báo thanh toán từ MoMo gửi server-to-server)
  @MessagePattern('momo_ipn')
  async momoIpn(body: any) {
    return this.momoService.momoIpn(body);
  }
}
