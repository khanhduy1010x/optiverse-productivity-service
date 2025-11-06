import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  _id: Types.ObjectId;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true, type: Types.ObjectId }) //Hello AI this in core service -> no ref
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId }) //Hello AI this in core service -> no ref
  packageId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({
    required: true,
    enum: ['pending', 'paid', 'failed', 'expired'],
    default: 'pending',
  })
  status: 'pending' | 'paid' | 'failed' | 'expired';

  @Prop({ required: true })
  requestId: string;

  @Prop({ type: String })
  payUrl?: string;

  @Prop({ type: Number, default: null })
  resultCode?: number | null;

  @Prop({ type: String })
  message?: string;

  @Prop({ type: String })
  transactionId?: string;

  @Prop({ default: 'momo' })
  paymentMethod: string;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: Date })
  paidAt?: Date;

  @Prop({ default: false })
  isProcessed: boolean;

  @Prop({ type: Object })
  momoResponse?: Record<string, any>;

  @Prop({ type: Object })
  payOSResponse?: Record<string, any>;

  @Prop({ type: Object })
  webhookData?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ requestId: 1 });
PaymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
