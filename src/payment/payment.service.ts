import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { PaymentRepository } from './payment.repository';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { UserHttpClient } from '../http-axios/user-http.client';
import { UserInventoryService } from '../user-inventory/user-inventory.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly configService: ConfigService,
    private readonly userHttpClient: UserHttpClient,
    private readonly userInventoryService: UserInventoryService,
  ) {}

  async createMomoPayment(userId: string, packageId: string) {
    try {
      if (!userId || !packageId) {
        throw new BadRequestException('Invalid userId or packageId');
      }

      const packageInfo =
        await this.userHttpClient.getMembershipPackageById(packageId);
      const amount = packageInfo.data?.price || packageInfo.price;

      if (!amount || amount <= 0) {
        throw new BadRequestException('Invalid package price');
      }

      const orderId = `MEMBER_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const requestId = uuidv4();

      const payment = await this.paymentRepository.create({
        orderId,
        requestId,
        userId: new Types.ObjectId(userId),
        packageId: new Types.ObjectId(packageId),
        amount,
        status: 'pending',
        paymentMethod: 'momo',
      });

      const partnerCode = this.configService.get('MOMO_PARTNER_CODE');
      const accessKey = this.configService.get('MOMO_ACCESS_KEY');
      const secretKey = this.configService.get('MOMO_SECRET_KEY');
      const redirectUrl = this.configService.get('MOMO_REDIRECT_URL');
      const ipnUrl = this.configService.get('MOMO_IPN_URL');
      const momoApiUrl = this.configService.get(
        'MOMO_API_URL',
        'https://test-payment.momo.vn/v2/gateway/api/create',
      );

      if (!partnerCode || !accessKey || !secretKey) {
        throw new InternalServerErrorException('MoMo configuration is missing');
      }

      const orderInfo = `Membership payment for package ${packageId}`.trim();
      const requestType = 'captureWallet';
      const extraData = Buffer.from(
        JSON.stringify({ userId, packageId }),
      ).toString('base64');

      const amountStr = String(amount);
      const clean = (v: string) => v.trim().replace(/\s+/g, '');

      const rawSignature =
        `accessKey=${clean(accessKey)}` +
        `&amount=${clean(amountStr)}` +
        `&extraData=${clean(extraData)}` +
        `&ipnUrl=${clean(ipnUrl)}` +
        `&orderId=${clean(orderId)}` +
        `&orderInfo=${orderInfo.trim()}` +
        `&partnerCode=${clean(partnerCode)}` +
        `&redirectUrl=${clean(redirectUrl)}` +
        `&requestId=${clean(requestId)}` +
        `&requestType=${clean(requestType)}`;

      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature, 'utf8')
        .digest('hex');

      const momoPayload = {
        partnerCode,
        requestId,
        orderId,
        amount: amountStr,
        orderInfo,
        redirectUrl,
        ipnUrl,
        requestType,
        extraData,
        signature,
        lang: 'vi',
      };

      const momoRes = await axios.post<any>(momoApiUrl, momoPayload);
      const momoData = momoRes.data as any;

      if (momoData.resultCode !== 0) {
        this.logger.error(`MoMo API error: ${momoData.message}`, momoData);
        throw new BadRequestException(`MoMo API error: ${momoData.message}`);
      }

      await this.paymentRepository.saveMomoResponse(
        (payment as any)._id,
        momoData,
      );

      return {
        payUrl: momoData.payUrl,
        orderId,
        requestId,
        resultCode: momoData.resultCode,
        message: momoData.message,
      };
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        this.logger.error(
          `❌ MoMo API Error: ${status} - ${JSON.stringify(data)}`,
        );
        throw new BadRequestException(data?.message || 'MoMo API failed');
      }

      this.logger.error(
        `❌ Error creating MoMo payment: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async createPayOSPayment(userId: string, packageId: string) {
    try {
      if (!userId || !packageId) {
        throw new BadRequestException('Invalid userId or packageId');
      }

      const packageInfo =
        await this.userHttpClient.getMembershipPackageById(packageId);
      const amount = packageInfo.data?.price || packageInfo.price;

      if (!amount || amount <= 0) {
        throw new BadRequestException('Invalid package price');
      }

      const orderCode = Math.floor(Math.random() * 1000000);
      const requestId = uuidv4();

      const payment = await this.paymentRepository.create({
        orderId: orderCode.toString(),
        requestId,
        userId: new Types.ObjectId(userId),
        packageId: new Types.ObjectId(packageId),
        amount,
        status: 'pending',
        paymentMethod: 'QR',
        isProcessed: false,
        message: `Membership payment for package ${packageId}`,
      });

      const clientId = this.configService.get('CLIENT_ID_PAYOS');
      const apiKey = this.configService.get('API_KEY_PAYOS');
      const checkSumKey = this.configService.get('CHECK_SUM_KEY_PAYOS');
      const redirectUrl = this.configService.get('REDIRECT_PAYOS_URL');

      if (!clientId || !apiKey || !checkSumKey || !redirectUrl) {
        throw new InternalServerErrorException(
          'PayOS configuration is missing',
        );
      }
      const cancelUrl = redirectUrl + 'payment-cancel.html';
      const returnUrl = redirectUrl + 'payment-result.html';
      const description = 'MMP PAYOS';
      const dataToSign = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;

      const signature = crypto
        .createHmac('sha256', checkSumKey)
        .update(dataToSign, 'utf8')
        .digest('hex');

      const payOSPayload = {
        orderCode,
        amount,
        description,
        cancelUrl,
        returnUrl,
        expiredAt: Math.floor(Date.now() / 1000) + 10 * 60,
        signature,
      };

      const payOSApiUrl = 'https://api-merchant.payos.vn/v2/payment-requests';

      const payOSRes = await axios.post<any>(payOSApiUrl, payOSPayload, {
        headers: {
          'x-client-id': clientId,
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      const payOSData = payOSRes.data as any;

      if (payOSData.code !== '00') {
        this.logger.error(`PayOS API error: ${payOSData.message}`, payOSData);
        throw new BadRequestException(`PayOS API error: ${payOSData.message}`);
      }

      await this.paymentRepository.savePayOSResponse(
        (payment as any)._id,
        payOSData,
      );

      return {
        checkoutUrl: payOSData.data?.checkoutUrl,
        orderId: orderCode.toString(),
        requestId,
        orderCode,
        code: payOSData.code,
        message: payOSData.message,
      };
    } catch (error: any) {
      this.logger.error(
        `❌ Error creating PayOS payment: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async handleMomoIPN(ipnData: any) {
    try {
      this.logger.debug(`Received IPN data: ${JSON.stringify(ipnData)}`);

      const secretKey = this.configService.get('MOMO_SECRET_KEY');
      if (!secretKey) {
        throw new InternalServerErrorException('MoMo secret key is missing');
      }

      const accessKey = this.configService.get('MOMO_ACCESS_KEY');

      const rawSignature =
        `accessKey=${accessKey}` +
        `&amount=${ipnData.amount}` +
        `&extraData=${ipnData.extraData}` +
        `&message=${ipnData.message}` +
        `&orderId=${ipnData.orderId}` +
        `&orderInfo=${ipnData.orderInfo}` +
        `&orderType=${ipnData.orderType}` +
        `&partnerCode=${ipnData.partnerCode}` +
        `&payType=${ipnData.payType}` +
        `&requestId=${ipnData.requestId}` +
        `&responseTime=${ipnData.responseTime}` +
        `&resultCode=${ipnData.resultCode}` +
        `&transId=${ipnData.transId}`;

      const calculatedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature, 'utf8')
        .digest('hex');

      if (ipnData.signature !== calculatedSignature) {
        this.logger.warn(`Invalid signature for order: ${ipnData.orderId}`);
        return { resultCode: 1, message: 'Invalid signature' };
      }

      const payment = await this.paymentRepository.findByOrderId(
        ipnData.orderId,
      );
      if (!payment || payment == null) {
        this.logger.warn(`Payment not found for order: ${ipnData.orderId}`);
        return { resultCode: 1, message: 'Payment not found' };
      }

      if (payment.isProcessed) {
        return { resultCode: 0, message: 'Payment already processed' };
      }

      await this.paymentRepository.saveWebhookData(payment._id, ipnData);

      const status = ipnData.resultCode === 0 ? 'paid' : 'failed';
      const updatedPayment = await this.paymentRepository.updateStatus(
        payment._id,
        status,
        {
          transactionId: ipnData.transId?.toString(),
          isProcessed: true,
        },
      );

      if (status === 'paid') {
        await this.handlePaymentSuccess(updatedPayment);
      }

      return { resultCode: 0, message: 'Success' };
    } catch (error) {
      this.logger.error(`Error handling MoMo IPN:`, error);
      return { resultCode: 99, message: 'Internal server error' };
    }
  }

  async handlePayOSWebhook(webhookBody: any) {
    try {
      this.logger.debug(
        `Received PayOS Webhook: ${JSON.stringify(webhookBody)}`,
      );

      const checkSumKey = this.configService.get('CHECK_SUM_KEY_PAYOS');

      if (!checkSumKey) {
        throw new InternalServerErrorException('PayOS checksum key is missing');
      }

      const data = webhookBody.data || {};
      const signature = webhookBody.signature;

      // Verify signature using PayOS method: sort by key and convert to query string
      const sortedData = this.sortObjDataByKey(data);
      const dataQueryStr = this.convertObjToQueryStr(sortedData);
      const calculatedSignature = crypto
        .createHmac('sha256', checkSumKey)
        .update(dataQueryStr)
        .digest('hex');

      if (signature !== calculatedSignature) {
        this.logger.warn(
          `Invalid PayOS signature for orderCode: ${data.orderCode}. Expected: ${calculatedSignature}, Got: ${signature}`,
        );
        return { resultCode: 1, message: 'Invalid signature' };
      }

      const orderCode = data.orderCode?.toString();
      const payment = await this.paymentRepository.findByOrderId(orderCode);

      if (!payment || payment == null) {
        this.logger.warn(`Payment not found for orderCode: ${orderCode}`);
        return { resultCode: 1, message: 'Payment not found' };
      }

      if (payment.isProcessed) {
        this.logger.log(
          `Payment already processed for orderCode: ${orderCode}`,
        );
        return { resultCode: 0, message: 'Payment already processed' };
      }

      await this.paymentRepository.saveWebhookData(payment._id, webhookBody);

      const isSuccess =
        webhookBody.code === '00' && webhookBody.success === true;
      const status = isSuccess ? 'paid' : 'failed';

      const updatedPayment = await this.paymentRepository.updateStatus(
        payment._id,
        status,
        {
          transactionId: data.reference?.toString(),
          isProcessed: true,
        },
      );

      if (status === 'paid') {
        await this.handlePaymentSuccess(updatedPayment);
      }

      return { resultCode: 0, message: 'Success' };
    } catch (error) {
      this.logger.error(`Error handling PayOS webhook:`, error);
      return { resultCode: 99, message: 'Internal server error' };
    }
  }

  /**
   * Helper: Sort object by keys (for PayOS signature verification)
   */
  private sortObjDataByKey(object: any): any {
    const orderedObject = Object.keys(object)
      .sort()
      .reduce((obj: any, key: string) => {
        obj[key] = object[key];
        return obj;
      }, {});
    return orderedObject;
  }

  /**
   * Helper: Convert object to query string (for PayOS signature verification)
   */
  private convertObjToQueryStr(object: any): string {
    return Object.keys(object)
      .filter((key) => object[key] !== undefined)
      .map((key) => {
        let value = object[key];
        // Sort nested object
        if (value && Array.isArray(value)) {
          value = JSON.stringify(
            value.map((val: any) => this.sortObjDataByKey(val)),
          );
        }
        // Set empty string if null
        if ([null, undefined, 'undefined', 'null'].includes(value)) {
          value = '';
        }
        return `${key}=${value}`;
      })
      .join('&');
  }

  private async handlePaymentSuccess(payment: any) {
    try {
      const membershipResponse = await this.userHttpClient.updateUserMembership(
        payment.userId.toString(),
        payment.packageId.toString(),
      );
      this.logger.log(`Payment success handler for payment: ${payment._id}`);

      try {
        let packageData = membershipResponse?.data?.package;

        if (!packageData) {
          const packageInfo =
            await this.userHttpClient.getMembershipPackageById(
              payment.packageId.toString(),
            );
          packageData = packageInfo.data || packageInfo;
        }

        const opBonusCredits =
          packageData?.opBonusCredits || packageData?.op_bonus_credits || 0;

        if (opBonusCredits > 0) {
          await this.userInventoryService.addOpCredits(
            payment.userId.toString(),
            opBonusCredits,
          );
          this.logger.log(
            `Added ${opBonusCredits} OP credits to user ${payment.userId} from payment ${payment._id}`,
          );
        }
      } catch (opError) {
        this.logger.error(
          `Error adding OP credits to user inventory:`,
          opError,
        );
      }
    } catch (error) {
      this.logger.error(`Error in payment success handler:`, error);
    }
  }

  async getUserPaymentHistory(userId: string, limit = 10, skip = 0) {
    const payments = await this.paymentRepository.findByUserId(
      userId,
      limit,
      skip,
    );

    // Populate package info and user info
    const enrichedPayments = await Promise.all(
      payments.map(async (payment: any) => {
        try {
          // Get package info
          const packageInfo =
            await this.userHttpClient.getMembershipPackageById(
              payment.packageId.toString(),
            );
          const packageData = packageInfo.data || packageInfo;

          return {
            _id: payment._id,
            orderId: payment.orderId,
            requestId: payment.requestId,
            amount: payment.amount,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            paidAt: payment.paidAt,
            expiresAt: payment.expiresAt,
            // Package info
            package: {
              _id: packageData._id || packageData.id,
              name: packageData.name,
              level: packageData.level,
              price: packageData.price,
              opBonusCredits:
                packageData.opBonusCredits || packageData.op_bonus_credits,
              duration_days:
                packageData.duration_days || packageData.durationDays,
            },
          };
        } catch (error) {
          this.logger.warn(
            `Failed to populate package info for payment ${payment._id}:`,
            error,
          );
          // Return basic info if package lookup fails
          return {
            _id: payment._id,
            orderId: payment.orderId,
            requestId: payment.requestId,
            amount: payment.amount,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            paidAt: payment.paidAt,
            expiresAt: payment.expiresAt,
            package: null,
          };
        }
      }),
    );

    return enrichedPayments;
  }

  async getPaymentDetail(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }
    return payment;
  }

  async getPaymentByOrderId(orderId: string) {
    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }
    return payment;
  }

  async retryPayment(orderId: string) {
    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status !== 'failed' && payment.status !== 'expired') {
      throw new BadRequestException(
        'Only failed or expired payments can be retried',
      );
    }

    await this.paymentRepository.updateStatus((payment as any)._id, 'pending', {
      isProcessed: false,
      transactionId: undefined,
      webhookData: undefined,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    return this.createMomoPayment(
      payment.userId.toString(),
      payment.packageId.toString(),
    );
  }

  async getPendingPayments() {
    return this.paymentRepository.findPending();
  }

  async getExpiredPayments() {
    return this.paymentRepository.findExpired();
  }

  async manualMarkAsPaid(paymentId: string, transactionId?: string) {
    return this.paymentRepository.updateStatus(paymentId, 'paid', {
      transactionId,
      isProcessed: true,
    });
  }

  async getPackageInfoByIds(packageIds: string[]) {
    return this.userHttpClient.getMembershipPackagesByIds(packageIds);
  }
}
