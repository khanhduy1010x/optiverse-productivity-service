import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type PurchaseHistoryDocument = PurchaseHistory & Document;

@Schema({ timestamps: true })
export class PurchaseHistory {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  buyer_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  seller_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'MarketplaceItem' })
  marketplace_item_id: Types.ObjectId;

  @Prop({ required: true })
  price: number;

  @Prop({ type: Date, default: Date.now })
  purchased_at: Date;
}

export const PurchaseHistorySchema = SchemaFactory.createForClass(PurchaseHistory);
