import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as https from 'https';

@Injectable()
export class MomoService {
  async createMoMoPayment(amount: number, orderInfo: string): Promise<any> {
    const accessKey = 'F8BBA842ECF85';
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const partnerCode = 'MOMO';
    const redirectUrl =
      'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
    const ipnUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
    const lang = 'vi';
    const autoCapture = true;
    const extraData = '';
    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    const paymentCode =
      'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';

    // Prepare raw signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&paymentCode=${paymentCode}&requestId=${requestId}`;

    // Log raw signature for debugging
    console.log('Raw Signature:', rawSignature);

    // Create signature using HMAC SHA256
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    // Log the generated signature for debugging
    console.log('Generated Signature:', signature);

    // Prepare request body
    const requestBody = {
      partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang,
      autoCapture,
      extraData,
      paymentCode,
      signature,
    };

    console.log('Request Body:', JSON.stringify(requestBody));

    try {
      // Send the request using fetch
      const response = await fetch(
        'https://test-payment.momo.vn/v2/gateway/api/pos',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(
              JSON.stringify(requestBody),
            ).toString(),
          },
          body: JSON.stringify(requestBody),
        },
      );

      // Check if the response is OK
      if (!response.ok) {
        const errorResponse = await response.text(); // Capture the error body text
        console.error('MoMo API Response Error:', errorResponse);
        throw new Error(`MoMo API returned error: ${response.statusText}`);
      }

      const responseBody = await response.json();
      console.log('MoMo API Raw Response:', responseBody);

      if (responseBody.errorCode) {
        console.error('MoMo Error Code:', responseBody.errorCode);
        console.error('MoMo Error Message:', responseBody.message);
        throw new Error(`MoMo Error: ${responseBody.message}`);
      }

      // Return response from MoMo
      return responseBody;
    } catch (error) {
      // Log any error during the fetch request
      console.error('Error during MoMo payment request:', error);
      throw new Error('Error during MoMo payment request');
    }
  }

  async momoCallback(query: any): Promise<any> {
    console.log('Momo Callback:', query);
    return { status: 'callback received', data: query };
  }

  async momoIpn(body: any): Promise<any> {
    console.log('Momo IPN:', body);
    return { status: 'ipn received' };
  }
}
