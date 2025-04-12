import { Controller } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}
 
  @MessagePattern('create_payment_url')
  async createPaymentUrl(data: any) {
    try {
      console.log('Microservice | Received create_payment_url request:', data);
      
      const { amount, orderId, ipAddr, bankCode, orderInfo } = data;
      const paymentUrl = await this.vnpayService.createPaymentUrl({
        amount,
        orderId,
        ipAddr: ipAddr || '127.0.0.1', // Fallback IP
        bankCode,
        orderDescription: orderInfo || `Payment for order ${orderId}`,
      });

      return { 
        success: true,
        url: paymentUrl 
      };
    } catch (error) {
      console.error('Microservice | VNPay error:', error);
      // throw new RpcException({
      //   success: false,
      //   message: 'Failed to create VNPay URL',
      //   code: 'VNPAY_ERROR',
      // });
    }
  }

  @MessagePattern('handle_payment_return')
  async handlePaymentReturn(query: any) {
    try {
      console.log('Microservice | Processing VNPay return:', query);
      
      const isValid = await this.vnpayService.verifyReturn(query);
      if (!isValid) {
        throw new Error('Invalid VNPay signature');
      }

      return {
        success: true,
        transactionStatus: query.vnp_TransactionStatus === '00',
        amount: Number(query.vnp_Amount) / 100, // Convert back to VND
        orderId: query.vnp_TxnRef,
      };
    } catch (error) {
      console.error('Microservice | VNPay verification failed:', error);
      // throw new RpcException({
      //   success: false,
      //   message: 'Invalid payment confirmation',
      //   code: 'VNPAY_VERIFICATION_FAILED',
      // });
    }
  }

}
