import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'marketplace_followers' })
export class MarketplaceFollower {
  _id: mongoose.Types.ObjectId;

  // ID của user đang follow
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  follower_id: Types.ObjectId;

  // ID của creator đang bị follow
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  creator_id: Types.ObjectId;

  // Timestamps tự động
  createdAt?: Date;
  updatedAt?: Date;
}

export const MarketplaceFollowerSchema = SchemaFactory.createForClass(MarketplaceFollower);

// Tạo compound index để đảm bảo 1 user chỉ follow 1 creator 1 lần
MarketplaceFollowerSchema.index({ follower_id: 1, creator_id: 1 }, { unique: true });

// Index để query nhanh
MarketplaceFollowerSchema.index({ follower_id: 1, createdAt: -1 });
MarketplaceFollowerSchema.index({ creator_id: 1, createdAt: -1 });
MarketplaceFollowerSchema.index({ creator_id: 1 });
