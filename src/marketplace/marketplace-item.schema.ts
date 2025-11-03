import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

export enum MarketplaceItemType {
  FLASHCARD = 'FLASHCARD',

}

@Schema({ timestamps: true, collection: 'marketplace_items' })
export class MarketplaceItem {
  _id: mongoose.Types.ObjectId;

  // account người tạo
  @Prop({ type: Types.ObjectId, required: true })
  creator_id: Types.ObjectId;

  // tiêu đề sản phẩm
  @Prop({ required: true, trim: true })
  title: string;

  // mô tả ngắn
  @Prop({ trim: true })
  description?: string;

  // nhiều hình (preview)
  @Prop({ type: [String], default: [] })
  images: string[];

  // giá bán
  @Prop({ required: true })
  price: number;

  // loại (flashcard, ...)
  @Prop({
    type: String,
    enum: Object.values(MarketplaceItemType),
    required: true,
  })
  type: MarketplaceItemType;
  
  // ID của item gốc (flashcard, ...)
  @Prop({ type: Types.ObjectId })
  type_id?: Types.ObjectId;

  // ID tham chiếu đến item gốc (để tracking nguồn)
  @Prop({ type: Types.ObjectId })
  ref_id?: Types.ObjectId;

  // Bản sao dữ liệu của item gốc (để item marketplace không phụ thuộc vào item gốc)
  @Prop({ type: mongoose.Schema.Types.Mixed })
  copied_data?: Record<string, any>;

  // Danh sách ID của các đánh giá
  @Prop({ type: [Types.ObjectId], default: [], ref: 'Rating' })
  rate_id: Types.ObjectId[];
}

export const MarketplaceItemSchema = SchemaFactory.createForClass(MarketplaceItem);