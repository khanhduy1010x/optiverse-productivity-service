import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type AchievementDocument = Achievement & Document;

@Schema({ timestamps: true })
export class Achievement {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, unique: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  icon_url?: string;

  @Prop({ default: () => new Date() })
  created_at: Date;

  @Prop({ default: () => new Date() })
  updated_at: Date;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

// Thêm virtual để liên kết với achievement types
AchievementSchema.virtual('achievement_types', {
  ref: 'AchievementType',
  localField: '_id',
  foreignField: 'achievement_id',
  justOne: false,
});

// Đảm bảo virtuals được bao gồm khi chuyển đổi sang JSON
AchievementSchema.set('toObject', { virtuals: true });
AchievementSchema.set('toJSON', { virtuals: true });
