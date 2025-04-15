/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import moment from 'moment';

@Injectable()
export class ZalopayService {
  private readonly config = {
    app_id: '2553',
    key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
    endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
  };
  async createPayment(dataInfo: any): Promise<any> {
    const transID = Math.floor(Math.random() * 1000000);
    const embed_data = {
      redirecturl: 'http://localhost:3000/payment-result',
    };
    const items = [{}];

    const order: any = {
      app_id: this.config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
      app_user: 'user123',
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: 50000,
      description: `Thanh toán vé - Mã GD: #${transID}`,
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
      console.error('ZaloPay API error:', error);
      throw new Error('Failed to create ZaloPay payment');
    }
  }
}
