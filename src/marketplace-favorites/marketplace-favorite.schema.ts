import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'marketplace_favorites' })
export class MarketplaceFavorite {
  _id: mongoose.Types.ObjectId;

  // ID của user đã favorite
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user_id: Types.ObjectId;

  // ID của marketplace item được favorite
  @Prop({ type: Types.ObjectId, required: true, ref: 'MarketplaceItem' })
  marketplace_item_id: Types.ObjectId;

  // Timestamps tự động
  createdAt?: Date;
  updatedAt?: Date;
}

export const MarketplaceFavoriteSchema = SchemaFactory.createForClass(MarketplaceFavorite);

// Tạo compound index để đảm bảo 1 user chỉ favorite 1 item 1 lần
MarketplaceFavoriteSchema.index({ user_id: 1, marketplace_item_id: 1 }, { unique: true });

// Index để query nhanh
MarketplaceFavoriteSchema.index({ user_id: 1, createdAt: -1 });
MarketplaceFavoriteSchema.index({ marketplace_item_id: 1 });
