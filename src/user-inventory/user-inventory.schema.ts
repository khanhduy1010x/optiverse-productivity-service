import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type UserInventoryDocument = HydratedDocument<UserInventory>;
export type FrameDocument = HydratedDocument<Frame>;

@Schema({ timestamps: true })
export class UserInventory {
  _id: mongoose.Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  op: string;

  @Prop({ type: [String], required: true })
  frame: string[]; 

  @Prop({ type: String, default: null })
  active_frame?: string; // frame đang được sử dụng bởi user
}

@Schema({ timestamps: true })
export class Frame {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  icon_url?: string; // link ảnh Cloudinary

  @Prop({ required: true, min: 1 })
  cost: number; // số điểm cần để đổi frame này
}

export const UserInventorySchema = SchemaFactory.createForClass(UserInventory);
export const FrameSchema = SchemaFactory.createForClass(Frame);
