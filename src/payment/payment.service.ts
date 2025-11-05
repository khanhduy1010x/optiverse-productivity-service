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

      console.log('Momo Data:', momoData);
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

  /**
   * 2️⃣ POST /membership/momo/ipn
   * Nhận callback từ MoMo và xác thực chữ ký
   */
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

      // ✅ 2️⃣ Các bước xử lý sau khi xác thực
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

  /**
   * 3️⃣ Xử lý logic sau khi thanh toán thành công
   * Cấp quyền membership cho user, add OP credits, etc
   */
  private async handlePaymentSuccess(payment: any) {
    try {
      // Update user membership and get package info at the same time
      const membershipResponse = await this.userHttpClient.updateUserMembership(
        payment.userId.toString(),
        payment.packageId.toString(),
      );
      this.logger.log(`Payment success handler for payment: ${payment._id}`);

      // Extract package info from response to add OP credits
      try {
        let packageData = membershipResponse?.data?.package;

        // If package data not in response, fetch it separately
        if (!packageData) {
          const packageInfo =
            await this.userHttpClient.getMembershipPackageById(
              payment.packageId.toString(),
            );
          packageData = packageInfo.data || packageInfo;
        }

        const opBonusCredits =
          packageData?.opBonusCredits || packageData?.op_bonus_credits || 0;

        // Add OP credits to user inventory
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
        // Don't throw - OP addition failure shouldn't fail the payment success
      }
    } catch (error) {
      this.logger.error(`Error in payment success handler:`, error);
    }
  }

  /**
   * Lấy lịch sử thanh toán của user
   */
  async getUserPaymentHistory(userId: string, limit = 10, skip = 0) {
    return this.paymentRepository.findByUserId(userId, limit, skip);
  }

  /**
   * Lấy chi tiết payment
   */
  async getPaymentDetail(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }
    return payment;
  }

  /**
   * Lấy payment by orderId
   */
  async getPaymentByOrderId(orderId: string) {
    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }
    return payment;
  }

  /**
   * Retry thanh toán (user click "Thử lại")
   */
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

    // Reset payment record
    await this.paymentRepository.updateStatus((payment as any)._id, 'pending', {
      isProcessed: false,
      transactionId: undefined,
      webhookData: undefined,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    // Retry create MoMo payment
    return this.createMomoPayment(
      payment.userId.toString(),
      payment.packageId.toString(),
    );
  }

  /**
   * Admin: Lấy tất cả pending payments
   */
  async getPendingPayments() {
    return this.paymentRepository.findPending();
  }

  /**
   * Admin: Lấy tất cả expired payments
   */
  async getExpiredPayments() {
    return this.paymentRepository.findExpired();
  }

  /**
   * Admin: Manually mark payment as paid (for testing)
   */
  async manualMarkAsPaid(paymentId: string, transactionId?: string) {
    return this.paymentRepository.updateStatus(paymentId, 'paid', {
      transactionId,
      isProcessed: true,
    });
  }

  /**
   * Get package info by list of package IDs
   */
  async getPackageInfoByIds(packageIds: string[]) {
    return this.userHttpClient.getMembershipPackagesByIds(packageIds);
  }
}
