import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type FocusSessionDocument = FocusSession & Document;

@Schema({ timestamps: true })
export class FocusSession {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  start_time: Date;

  @Prop({ required: true })
  end_time: Date;
}

export const FocusSessionSchema = SchemaFactory.createForClass(FocusSession);
