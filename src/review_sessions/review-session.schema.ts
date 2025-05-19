import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type ReviewSessionDocument = ReviewSession & Document;

@Schema({ timestamps: true })
export class ReviewSession {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Flashcard' })
  flashcard_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true, type: Date })
  last_review: Date;

  @Prop({ required: true, type: Date })
  next_review: Date;

  @Prop({ required: true, type: Number, default: 1 })
  interval: number;

  @Prop({ required: true, type: Number, default: 2.5 })
  ease_factor: number;

  @Prop({ required: true, type: Number, default: 0 })
  repetition_count: number;

  @Prop({ required: true, type: Number, min: 0, max: 3 })
  quality: number;
}

export const ReviewSessionSchema = SchemaFactory.createForClass(ReviewSession);
