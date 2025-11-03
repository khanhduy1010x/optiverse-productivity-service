import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'marketplace_ratings' })
export class Rating {
  _id: mongoose.Types.ObjectId;

  // ID của marketplace item được đánh giá
  @Prop({ type: Types.ObjectId, required: true, ref: 'MarketplaceItem' })
  marketplace_id: Types.ObjectId;

  // ID của người đánh giá
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user_id: Types.ObjectId;

  // Bình luận/nhận xét của người dùng
  @Prop({ trim: true })
  comment?: string;

  // Số điểm đánh giá (1-5)
  @Prop({ 
    required: true, 
    min: 1, 
    max: 5,
    type: Number,
  })
  rating: number;

  // Thời gian tạo/cập nhật (tự động)
  createdAt?: Date;
  updatedAt?: Date;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
