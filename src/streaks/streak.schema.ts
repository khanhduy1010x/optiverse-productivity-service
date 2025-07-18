import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type StreakDocument = Streak & Document;

@Schema({ timestamps: true })
export class Streak {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  loginStreak: number;

  @Prop({ type: Date })
  lastLoginDate: Date;

  @Prop({ type: Number, default: 0 })
  taskStreak: number;

  @Prop({ type: Date })
  lastTaskDate: Date;

  @Prop({ type: Number, default: 0 })
  flashcardStreak: number;

  @Prop({ type: Date })
  lastFlashcardDate: Date;
}

export const StreakSchema = SchemaFactory.createForClass(Streak); 