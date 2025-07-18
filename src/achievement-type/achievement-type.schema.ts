import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type AchievementTypeDocument = AchievementType & Document;

export enum ConditionTypeEnum {
  TASKS_COMPLETED = 'TASKS_COMPLETED',
  TASKS_COMPLETED_WEEKLY = 'TASKS_COMPLETED_WEEKLY',
  TASKS_COMPLETED_MONTHLY = 'TASKS_COMPLETED_MONTHLY',
  FRIENDS_COUNT = 'FRIENDS_COUNT',
  LOGIN_STREAK = 'LOGIN_STREAK',
  TASK_STREAK = 'TASK_STREAK',
  FLASHCARD_STREAK = 'FLASHCARD_STREAK',
}

@Schema({ timestamps: true })
export class AchievementType {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  achievement_id: Types.ObjectId;

  @Prop({ required: true, enum: Object.values(ConditionTypeEnum) })
  condition_type: string;

  @Prop({ required: true })
  condition_value: number;
}

export const AchievementTypeSchema = SchemaFactory.createForClass(AchievementType); 