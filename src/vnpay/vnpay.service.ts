import { Injectable } from '@nestjs/common';
import qs from 'qs';
import * as crypto from 'crypto-js';
import axios from 'axios';

@Injectable()
export class VnpayService {
  
  private readonly vnpConfig = {
    vnp_TmnCode: 'VAR6GUC4', // Merchant code của bạn
    vnp_HashSecret: '57DQEDCLNYSO4WLR0GDE7V4D88V3Q7UE', // Secret key
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // URL Sandbox
    vnp_ReturnUrl: 'http://localhost:3000/payment-result', // URL return sau thanh toán
  };

  createPaymentUrl(params: {
    amount: number;
    orderId: string;
    ipAddr: string;
    bankCode?: string;
    orderDescription: string;
  }): string {
    const { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl } = this.vnpConfig;

    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: params.orderId,
      vnp_OrderInfo: params.orderDescription,
      vnp_Amount: params.amount * 100, // VNPay yêu cầu số tiền nhân 100
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: params.ipAddr,
      vnp_CreateDate: this.getCurrentDateTime(),
      ...(params.bankCode && { vnp_BankCode: params.bankCode }),
    };

    const signedParams = this.signParams(vnpParams, vnp_HashSecret);
    return `${vnp_Url}?${qs.stringify(signedParams, { encode: false })}`;
  }

  verifyReturn(query: Record<string, any>): boolean {
    const secureHash = query['vnp_SecureHash'];
    const cleanedQuery = { ...query };
    delete cleanedQuery['vnp_SecureHash'];
    delete cleanedQuery['vnp_SecureHashType'];

    const signedParams = this.signParams(cleanedQuery, this.vnpConfig.vnp_HashSecret);
    return secureHash === signedParams['vnp_SecureHash'];
  }

  private signParams(params: Record<string, any>, secretKey: string): Record<string, any> {
    const sortedParams = this.sortObject(params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const signature = crypto.HmacSHA512(signData, secretKey).toString();
    return { ...sortedParams, vnp_SecureHash: signature };
  }

  private sortObject(obj: Record<string, any>): Record<string, any> {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  }

  private getCurrentDateTime(): string {
    return new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14); // Format: yyyyMMddHHmmss
  }
}
