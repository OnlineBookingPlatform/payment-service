/* eslint-disable @typescript-eslint/require-await */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DTO_RQ_CheckMomoPayment, DTO_RQ_Momo, DTO_RQ_Ticket } from './momo.dto';
import * as crypto from 'crypto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TransactionHistory } from 'src/transaction/transaction_history.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MomoService {
  @InjectRepository(TransactionHistory)
  private readonly paymentRepository: Repository<TransactionHistory>;
  constructor(private readonly httpService: HttpService) {}
  private readonly config = {
    apiGatewayUrl: 'http://localhost:3002',
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    orderInfo: 'Thanh toán vé',
    partnerCode: 'MOMO',
    redirectUrl: 'http://localhost:3000/payment-success',
    ipnUrl: 'http://localhost:3000/payment-success',
    requestType: "payWithMethod",
    baseUrl: 'https://test-payment.momo.vn',
    endpoint: '/v2/gateway/api/create',
  };


  // Tạo giao dịch thanh toán MoMo
  // Tạo thông tin lịch sử giao dịch trong DB
  // Tạo thông tin vé trong DB
  async createMoMoPayment(data: DTO_RQ_Momo): Promise<any> {
    console.log('🚀 Bắt đầu tạo MoMo payment với data:', data);
    
    // Tạo orderId và requestId
    const orderId = this.config.partnerCode + new Date().getTime();
    const requestId = orderId;
    console.log('🆔 Generated Order ID:', orderId);
    console.log('🆔 Generated Request ID:', requestId);

    const description = `Thanh toán vé ${data.ticket.map(t => t.seat_name).join(',')} - ${data.ticket.map(t => t.id).join(',')}`;

    // Tính tổng tiền
    const amount = data.ticket.reduce((sum, item) => sum + item.price, 0);
    console.log('💰 Tổng số tiền thanh toán:', amount);

    const extraData = '';
    console.log('📦 Extra Data:', extraData);

    // Tạo raw signature
    const rawSignature = this.generateRawSignature({
      amount: amount.toString(),
      extraData,
      orderId,
      requestId,
    });
    console.log('🔏 Raw Signature:', rawSignature);

    // Tạo signature
    const signature = this.generateSignature(rawSignature);
    console.log('🔐 Signature:', signature);

    // Tạo request body
    const requestBody = {
      partnerCode: this.config.partnerCode,
      partnerName: "Test",
      storeId: "VinaHome",
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo: this.config.orderInfo,
      redirectUrl: this.config.redirectUrl,
      ipnUrl: this.config.ipnUrl,
      lang: 'vi',
      requestType: this.config.requestType,
      autoCapture: true,
      extraData,
      orderGroupId: '',
      signature,
    };
    console.log('📨 Request Body gửi đến MoMo:', JSON.stringify(requestBody, null, 2));

    try {
      console.log('🔄 Đang gửi request đến MoMo...');
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.baseUrl}${this.config.endpoint}`,
          requestBody,
          { headers: { 'Content-Type': 'application/json' } },
        ),
      );
      console.log('✅ Nhận được response từ MoMo:', JSON.stringify(response.data, null, 2));
    
      // Lưu lịch sử giao dịch vào DB
      try {
        const transaction = await this.paymentRepository.save({
          order_id: orderId,
          amount,
          status: 'pending',
          account_id: data.creator_by_id,
          company_id: data.service_provider_id,
          email: data.email,
          phone: data.passenger_phone,
          description,
          created_at: new Date(),
        });
        console.log('✅ Đã lưu transaction:', transaction);
      } catch (error) {
        console.error('❌ Lỗi khi lưu transaction:', error);
        return { return_code: 0, return_message: 'Lỗi khi lưu transaction' };
      }
    
      // Gọi API lưu thông tin vé
      try {
        const ticketResponse = await firstValueFrom(
          this.httpService.post(
            `${this.config.apiGatewayUrl}/v2/ticket/create-ticket-by-payment-service`,
            data,
            { headers: { 'Content-Type': 'application/json' } },
          ),
        );
        console.log('✅ Nhận được response từ API Gateway:', ticketResponse.data);
      } catch (error) {
        console.error('❌ Lỗi khi lưu thông tin vé:', error);
        return { return_code: 0, return_message: 'Lỗi khi lưu thông tin vé' };
      }
    
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi tạo MoMo payment:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new HttpException('Lỗi khi tạo MoMo payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
  }

  private generateRawSignature(params: {
    amount: string;
    extraData: string;
    orderId: string;
    requestId: string;
  }): string {
    const { amount, extraData, orderId, requestId } = params;
    
    return `accessKey=${this.config.accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${this.config.ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${this.config.orderInfo}` +
      `&partnerCode=${this.config.partnerCode}` +
      `&redirectUrl=${this.config.redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${this.config.requestType}`;
  }
  private generateSignature(rawSignature: string): string {
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');
  }
  private generateQuerySignature(params: { accessKey: string, partnerCode: string, orderId: string, requestId: string }): string {
    const rawSignature = `accessKey=${params.accessKey}&orderId=${params.orderId}&partnerCode=${params.partnerCode}&requestId=${params.requestId}`;
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  async queryMoMoTransaction(data: DTO_RQ_CheckMomoPayment): Promise<any> {
    const orderId = data.orderId;
    const requestId = data.requestId;

    const signature = this.generateQuerySignature({
      accessKey: this.config.accessKey,
      partnerCode: this.config.partnerCode,
      orderId,
      requestId,
    });

    const requestBody = {
      partnerCode: this.config.partnerCode,
      requestId,
      orderId,
      lang: 'vi',
      signature,
    };

    console.log('🔍 Gửi truy vấn trạng thái MoMo:', requestBody);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.baseUrl}/v2/gateway/api/query`,
          requestBody,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
      console.log('📄 Kết quả truy vấn:', response.data);
      try {
        const transaction = await this.paymentRepository.findOne({
          where: { order_id: orderId },
        });
        if (transaction) {
          transaction.status = response.data.resultCode === 0 ? 'success' : 'pending';
          console.log('✅ Cập nhật trạng thái giao dịch:', transaction);
          await this.paymentRepository.save(transaction);
        }
      } catch (error) {
        console.error('❌ Lỗi khi cập nhật trạng thái giao dịch:', error);
        throw new HttpException('Lỗi khi cập nhật trạng thái giao dịch', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      try {
        const ticketResponse = await firstValueFrom(
          this.httpService.post(
            `${this.config.apiGatewayUrl}/v2/ticket/update-paid-ticket-amount`,
            data.ticket,
            { headers: { 'Content-Type': 'application/json' } },
          ),
        );
        console.log('✅ Nhận được response từ API Gateway:', ticketResponse.data);

      } catch (error) {
        console.error('❌ Lỗi khi cập nhật vé:', error);
        throw new HttpException('Lỗi khi cập nhật vé', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi truy vấn trạng thái MoMo:', error.message);
      throw new HttpException('Lỗi truy vấn trạng thái MoMo', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
