/* eslint-disable @typescript-eslint/no-unused-vars */
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
    console.log('🚀 Bắt đầu tạo payment với dataInfo:', dataInfo);
    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;
    console.log('🆔 Mã giao dịch app_trans_id:', app_trans_id);
    const amount = dataInfo.ticket[ 0 ].price * dataInfo.ticket.length;
    console.log('💰 Tổng số tiền:', amount);
    const description = `Thanh toán vé ${dataInfo.ticket.map(item => item.seat_name)}`;
    console.log('📝 Mô tả giao dịch:', description);


    try {
      const transaction = await this.paymentRepository.save({
        order_id: app_trans_id,
        amount,
        status: 'pending',
        account_id: dataInfo.account_id,
        company_id: dataInfo.service_provider_id,
        description,
        created_at: new Date()
      });
      console.log('✅ Đã lưu transaction:', transaction);
    } catch (error) {
      console.error('❌ Lỗi khi lưu transaction:', error);
    }
    

    const order: any = {
      app_id: this.config.app_id,
      app_trans_id,
      app_user: dataInfo.account_id,
      app_time: Date.now(),
      item: JSON.stringify(dataInfo.ticket),
      embed_data: JSON.stringify({}),
      amount,
      description,
      bank_code: '',
      // callback_url: this.config.callback_url
    };

    const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();

    console.log(`[DEV] Tạo payment giả lập: ${app_trans_id}`);
    return {
      return_code: 1,
      return_message: 'Local mock payment created',
      order_url: `http://localhost:3000/payment-method-2?app_trans_id=${app_trans_id}`,
      app_trans_id,
      amount,
      is_local: true
    };
   
  }
}


