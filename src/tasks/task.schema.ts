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
