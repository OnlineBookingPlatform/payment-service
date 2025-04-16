/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import moment from 'moment';
import { DTO_RQ_ZaloPay } from './zalopay.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHistory } from 'src/database/transaction_history.entity';

@Injectable()
export class ZalopayService {
  @InjectRepository(TransactionHistory)
  private readonly paymentRepository: Repository<TransactionHistory>;
  private readonly config = {
    app_id: '2553',
    key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
    endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
    success_url: 'http://localhost:3000/payment-success',
  };

  async createPayment(dataInfo: DTO_RQ_ZaloPay): Promise<any> {
    console.log('ZaloPay dataInfo:', dataInfo);
    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;
    // const embed_data = {
    //   redirecturl: 'http://localhost:3000/payment-result',
    // };
    // const items = [{}];

    const order: any = {
      app_id: this.config.app_id,
      app_trans_id,
      app_user: dataInfo.account_id,
      app_time: Date.now(),
      item: JSON.stringify([]),
      embed_data: JSON.stringify({}),
      amount: dataInfo.ticket[0].price * dataInfo.ticket.length,
      description: `Thanh toán vé ${dataInfo.ticket.map(
        (item) => item.seat_name,
      )}`,
      bank_code: '',
    };

    const data = `${this.config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();

    try {
      const response = await axios.post(this.config.endpoint, null, {
        params: order,
      });

      return response.data;
    } catch (error) {
      throw new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  callbackZaloPay(data: any): any {
    const result = {
      return_code: 0, // Mặc định là thất bại
      return_message: '',
    };

    try {
      // 1. Xác thực callback bằng MAC
      const dataForMac = `${data.app_id}|${data.app_trans_id}|${data.appuser}|${data.amount}|${data.mac}`;
      const mac = CryptoJS.HmacSHA256(dataForMac, this.config.key2).toString();

      if (mac !== data.mac) {
        result.return_message = 'Invalid MAC';
        return result;
      }

      // 2. Xử lý logic thanh toán (không dùng database)
      if (data.return_code === 1) {
        // Thanh toán thành công
        result.return_code = 1;
        result.return_message = 'Success';

        // Có thể log ra console để debug
        console.log('Thanh toán thành công:', {
          transactionId: data.app_trans_id,
          userId: data.appuser,
          amount: data.amount,
          zaloTransId: data.zp_trans_id,
        });
      } else {
        // Thanh toán thất bại
        result.return_message = data.return_message || 'Payment failed';

        console.log('Thanh toán thất bại:', {
          transactionId: data.app_trans_id,
          errorCode: data.return_code,
          errorMessage: data.return_message,
        });
      }

      return result;
    } catch (error) {
      console.error('Lỗi xử lý callback:', error);
      result.return_message = 'Server error';
      return result;
    }
  }
}
