import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type UserAchievementDocument = UserAchievement & Document;

@Schema({ timestamps: true })
export class UserAchievement {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Achievement' })
  achievement_id: Types.ObjectId;

  @Prop({ default: () => new Date() })
  unlocked_at: Date;

  @Prop({ default: () => new Date() })
  created_at: Date;

  @Prop({ default: () => new Date() })
  updated_at: Date;
}

export const UserAchievementSchema = SchemaFactory.createForClass(UserAchievement);
