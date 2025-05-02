/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller } from '@nestjs/common';
import { MomoService } from './momo.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleError } from 'src/utils/error-handler';
import { ApiResponse } from 'src/utils/api-response';
import { DTO_RQ_CheckMomoPayment, DTO_RQ_Momo } from './momo.dto';

@Controller()
export class MomoController {
  constructor(private readonly momoService: MomoService) { }

  @MessagePattern('create_momo_payment')
  async createMoMoPayment(@Payload() data: DTO_RQ_Momo): Promise<ApiResponse<any>> {
    try {
      const response = await this.momoService.createMoMoPayment(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
  @MessagePattern('check_momo_payment')
  async checkMoMoPayment(@Payload() data: DTO_RQ_CheckMomoPayment): Promise<ApiResponse<any>> {
    try {
      const response = await this.momoService.queryMoMoTransaction(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
}
