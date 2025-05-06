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
import { TransactionHistory } from 'src/transaction/transaction_history.entity';

@Injectable()
export class ZalopayService {
  @InjectRepository(TransactionHistory)
  private readonly paymentRepository: Repository<TransactionHistory>;
  private readonly config = {
    app_id: '2553',
    key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
    endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
    success_url: 'http://localhost:3000/payment-method-2',
    callback_url: 'https://5519-2001-ee0-4f00-57d0-2c7d-de02-b055-7534.ngrok-free.app/v3/zalopay/callback',
  };

  async createPayment(dataInfo: DTO_RQ_ZaloPay): Promise<any> {
    console.log('🚀 Bắt đầu tạo payment với dataInfo:', dataInfo);
    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;
    const amount = dataInfo.ticket.reduce((sum, item) => sum + item.price, 0);
    const description = `Thanh toán vé ${dataInfo.ticket.map(t => t.seat_name).join(',')} - ${dataInfo.ticket.map(t => t.id).join(',')}`;


    // Sửa phần item theo đúng chuẩn ZaloPay
    const items = dataInfo.ticket.map(ticket => ({
      itemid: ticket.id.toString(),
      name: `Vé ${ticket.seat_name}`,
      price: ticket.price,
      quantity: 1
    }));
    const embed_data = {
      redirecturl: this.config.success_url + "?app_trans_id=" + app_trans_id,
    };
    
    

    try {
      const transaction = await this.paymentRepository.save({
        order_id: app_trans_id,
        amount,
        status: 'pending',
        account_id: dataInfo.account_id,
        company_id: dataInfo.service_provider_id,
        description,
        created_at: new Date(),
      });
      console.log('✅ Đã lưu transaction:', transaction);
    } catch (error) {
      console.error('❌ Lỗi khi lưu transaction:', error);
      return { return_code: 0, return_message: 'Lỗi khi lưu transaction' };
    }

    const order: any = {
      app_id: this.config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
      app_user: "user123",
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      description: description,
      bank_code: "",
      callback_url: this.config.callback_url,
    };

    console.log('📦 Dữ liệu order chuẩn:', order);

    const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();

    try {
      const { data } = await axios.post(this.config.endpoint, null, { params: order });
      console.log('📬 Phản hồi từ ZaloPay:', data);

      if (data.return_code === 1) {
        console.log('✅ Thành công! Redirect tới ZaloPay:', data.order_url);
        return { success: true, order_url: data.order_url, app_trans_id };
      }

      // Nếu có lỗi từ ZaloPay
      console.error('❌ Lỗi từ ZaloPay:', data.return_message, data.sub_return_message);
      return {
        error: data.return_message,
        sub_error: data.sub_return_message,
        zalo_response: data // Trả cả response để debug
      };
    } catch (error) {
      console.error('❌ Lỗi kết nối ZaloPay:', error.response?.data || error.message);
      return {
        error: 'Lỗi kết nối ZaloPay',
        detail: error.response?.data || error.message
      };
    }

  }

  async callbackZaloPay(data: any): Promise<any> {
    console.log('🚀 Bắt đầu xử lý callback ZaloPay với data:', data);

    const result: any = {};
    try {
      const dataStr = data.data;
      const reqMac = data.mac;

      const mac = CryptoJS.HmacSHA256(dataStr, this.config.key2).toString();
      console.log('mac =', mac);

      if (reqMac !== mac) {
        result.return_code = -1;
        result.return_message = 'mac not equal';
      } else {
        const dataJson = JSON.parse(dataStr);
        const app_trans_id = dataJson['app_trans_id'];

        console.log("✅ Xác thực MAC thành công, cập nhật trạng thái đơn:", app_trans_id);

        // 🎯 Cập nhật trạng thái đơn trong database:
        await this.paymentRepository.update(
          { order_id: app_trans_id },
          { status: 'success' }
        );

        result.return_code = 1;
        result.return_message = 'success';
        console.log('✅ Cập nhật trạng thái thành công:', result.return_message);
      }
    } catch (ex) {
      console.error('❌ Lỗi callback xử lý:', ex.message);
      result.return_code = 0; // ZaloPay server sẽ callback lại tối đa 3 lần
      result.return_message = ex.message;
    }
    return result;
  }

  // async checkPayment(data: any): Promise<any> {
  //   console.log('🚀 Bắt đầu kiểm tra thanh toán với data:', data);
  //   return null;
  // }



}


