import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment } from './payment.schema';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
  ) {}

  async create(data: Partial<Payment>): Promise<Payment> {
    const payment = new this.paymentModel(data);
    return payment.save();
  }

  async findById(id: string | Types.ObjectId): Promise<Payment | null> {
    return this.paymentModel.findById(id).exec();
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    return this.paymentModel.findOne({ orderId }).exec();
  }

  async findByRequestId(requestId: string): Promise<Payment | null> {
    return this.paymentModel.findOne({ requestId }).exec();
  }

  async findByUserId(
    userId: string | Types.ObjectId,
    limit = 10,
    skip = 0,
  ): Promise<Payment[]> {
    return this.paymentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async findByStatus(
    status: 'pending' | 'paid' | 'failed' | 'expired',
  ): Promise<Payment[]> {
    return this.paymentModel.find({ status }).sort({ createdAt: -1 }).exec();
  }

  async updateStatus(
    id: string | Types.ObjectId,
    status: 'pending' | 'paid' | 'failed' | 'expired',
    additionalData?: Partial<Payment>,
  ): Promise<Payment | null> {
    return this.paymentModel
      .findByIdAndUpdate(
        id,
        {
          status,
          ...additionalData,
          ...(status === 'paid' && { paidAt: new Date() }),
        },
        { new: true },
      )
      .exec();
  }

  async updateByOrderId(
    orderId: string,
    data: Partial<Payment>,
  ): Promise<Payment | null> {
    return this.paymentModel
      .findOneAndUpdate({ orderId }, data, { new: true })
      .exec();
  }

  async markAsProcessed(id: string | Types.ObjectId): Promise<Payment | null> {
    return this.paymentModel
      .findByIdAndUpdate(id, { isProcessed: true }, { new: true })
      .exec();
  }

  async saveMomoResponse(
    id: string | Types.ObjectId,
    momoResponse: any,
  ): Promise<Payment | null> {
    return this.paymentModel
      .findByIdAndUpdate(id, { momoResponse }, { new: true })
      .exec();
  }

  async saveWebhookData(
    id: string | Types.ObjectId,
    webhookData: any,
  ): Promise<Payment | null> {
    return this.paymentModel
      .findByIdAndUpdate(id, { webhookData }, { new: true })
      .exec();
  }

  async findPending(): Promise<Payment[]> {
    return this.paymentModel
      .find({ status: 'pending', expiresAt: { $gt: new Date() } })
      .exec();
  }

  async findExpired(): Promise<Payment[]> {
    return this.paymentModel
      .find({ status: 'pending', expiresAt: { $lte: new Date() } })
      .exec();
  }
}
