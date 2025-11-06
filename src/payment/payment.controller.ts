import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UserDto } from 'src/user-dto/user.dto';
import { ApiResponse } from 'src/common/api-response';

@Controller('payment-membership')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  /**
   * 1️⃣ POST /membership/pay-momo
   * Tạo yêu cầu thanh toán tới MoMo
   * Body: { packageId, amount }
   * Return: { payUrl, orderId, requestId }
   */
  @Post('pay-momo')
  @HttpCode(200)
  async createMomoPayment(
    @Body() body: { packageId: string },
    @Req() req: any,
  ) {
    const user = req.userInfo as UserDto;
    this.logger.log(`Creating MoMo payment for user: ${user.userId}`);
    const result = await this.paymentService.createMomoPayment(
      user.userId,
      body.packageId,
    );
    return new ApiResponse<any>(result);
  }

  /**
   * 1️⃣ POST /membership/pay-payos
   * Tạo yêu cầu thanh toán tới PayOS
   * Body: { packageId }
   * Return: { checkoutUrl, orderId, requestId }
   */
  @Post('pay-payos')
  @HttpCode(200)
  async createPayOSPayment(
    @Body() body: { packageId: string },
    @Req() req: any,
  ) {
    const user = req.userInfo as UserDto;
    this.logger.log(`Creating PayOS payment for user: ${user.userId}`);
    const result = await this.paymentService.createPayOSPayment(
      user.userId,
      body.packageId,
    );
    return new ApiResponse<any>(result);
  }

  /**
   * 2️⃣ POST /membership/momo/ipn
   * Nhận callback từ MoMo
   * Không cần auth vì MoMo gọi từ server ngoài
   */
  @Post('public/momo/ipn')
  @HttpCode(200)
  async handleMomoIPN(@Body() ipnData: any) {
    this.logger.log(`Received MoMo IPN for order: ${ipnData.orderId}`);
    return this.paymentService.handleMomoIPN(ipnData);
  }

  /**
   * 2️⃣ POST /membership/payos/webhook
   * Nhận callback từ PayOS
   * Không cần auth vì PayOS gọi từ server ngoài
   */
  @Post('public/payos/webhook')
  @HttpCode(200)
  async handlePayOSWebhook(@Body() body: any) {
    this.logger.log(`Received PayOS Webhook`);
    console.log('PayOS Webhook Request Body:', JSON.stringify(body, null, 2));
    return this.paymentService.handlePayOSWebhook(body);
  }

  /**
   * 3️⃣ GET /membership/payment-history
   * Lấy lịch sử thanh toán của user
   */
  @Get('payment-history')
  async getPaymentHistory(
    @Req() req: any,
    @Body() query?: { limit?: number; skip?: number },
  ) {
    const user = req.userInfo as UserDto;
    const userId = user.userId;
    const limit = query?.limit || 10;
    const skip = query?.skip || 0;

    try {
      const payments = await this.paymentService.getUserPaymentHistory(
        userId,
        limit,
        skip,
      );

      // Service already populates package info, just return it
      return new ApiResponse<any>(payments);
    } catch (error: any) {
      this.logger.error(`Error fetching payment history: ${error.message}`);
      throw error;
    }
  }

  /**
   * 4️⃣ GET /membership/payment/:paymentId
   * Lấy chi tiết payment
   */
  @Get('payment/:paymentId')
  async getPaymentDetail(
    @Param('paymentId') paymentId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const payment = await this.paymentService.getPaymentDetail(paymentId);

    // Verify ownership
    if (payment.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    return payment;
  }

  /**
   * 5️⃣ GET /membership/payment-by-order/:orderId
   * Lấy payment by orderId
   */
  @Get('payment-by-order/:orderId')
  async getPaymentByOrderId(
    @Param('orderId') orderId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const payment = await this.paymentService.getPaymentByOrderId(orderId);

    // Verify ownership
    if (payment.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    return payment;
  }

  /**
   * 6️⃣ POST /membership/retry-payment/:orderId
   * Retry thanh toán (user click "Thử lại")
   */
  @Post('retry-payment/:orderId')
  @HttpCode(200)
  async retryPayment(@Param('orderId') orderId: string, @Req() req: any) {
    const userId = req.user.id;
    const payment = await this.paymentService.getPaymentByOrderId(orderId);

    // Verify ownership
    if (payment.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    return this.paymentService.retryPayment(orderId);
  }

  /**
   * 🔒 ADMIN: GET /membership/pending-payments
   * Lấy tất cả pending payments
   */
  @Get('admin/pending-payments')
  async getPendingPayments() {
    // TODO: Add @Admin() guard
    return this.paymentService.getPendingPayments();
  }

  /**
   * 🔒 ADMIN: GET /membership/expired-payments
   * Lấy tất cả expired payments
   */
  @Get('admin/expired-payments')
  async getExpiredPayments() {
    // TODO: Add @Admin() guard
    return this.paymentService.getExpiredPayments();
  }

  /**
   * 🔒 ADMIN: POST /membership/admin/mark-as-paid/:paymentId
   * Manually mark payment as paid (for testing)
   */
  @Post('admin/mark-as-paid/:paymentId')
  @HttpCode(200)
  async manualMarkAsPaid(
    @Param('paymentId') paymentId: string,
    @Body() body?: { transactionId?: string },
  ) {
    // TODO: Add @Admin() guard
    return this.paymentService.manualMarkAsPaid(paymentId, body?.transactionId);
  }
}
