/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller } from '@nestjs/common';
import { ZalopayService } from './zalopay.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleError } from 'src/utils/error-handler';
import { ApiResponse } from 'src/utils/api-response';
import { DTO_RQ_ZaloPay } from './zalopay.dto';

@Controller()
export class ZalopayController {
  constructor(private readonly zalopayService: ZalopayService) { }


  // https://docs.zalopay.vn/v2/start/#B
  @MessagePattern('create_payment')
  async createZaloPayPayment(@Payload() data: DTO_RQ_ZaloPay): Promise<ApiResponse<any>> {
    try {
      const response = await this.zalopayService.createPayment(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('callback_zalopay')
  async callbackZaloPay(@Payload() data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.zalopayService.callbackZaloPay(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('check_payment')
  async checkPayment(@Payload() data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.zalopayService.checkPayment(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
}
