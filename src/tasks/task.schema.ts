import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ enum: ['pending', 'completed', 'overdue'], default: 'pending' })
  status: string;

  @Prop({ enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: string;

  @Prop()
  start_time?: Date;

  @Prop()
  end_time?: Date;

  @Prop({ type: Date, default: () => new Date() })
  created_at: Date;

  @Prop({ type: Date, default: () => new Date() })
  updated_at: Date;

  @Prop({ type: Date, default: null })
  deleted_at?: Date;

  @Prop({ type: Date, default: () => new Date() })
  created_date: Date; // Date only (for daily quota tracking - resets at midnight)
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.virtual('tags', {
  ref: 'TaskTag',
  localField: '_id',
  foreignField: 'task',
  justOne: false,
  options: { populate: { path: 'tag' } },
});

TaskSchema.set('toObject', { virtuals: true });
TaskSchema.set('toJSON', { virtuals: true });
