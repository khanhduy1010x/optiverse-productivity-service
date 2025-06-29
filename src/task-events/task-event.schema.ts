import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type TaskEventDocument = TaskEvent & Document;

@Schema({ timestamps: true })
export class TaskEvent {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Task' })
  task_id: Types.ObjectId;

  @Prop({ default: 'Untitled Event' })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  start_time: Date;

  @Prop()
  end_time?: Date;

  @Prop({ default: false })
  all_day?: boolean;

  @Prop({ enum: ['none', 'daily', 'weekly', 'monthly', 'yearly', 'weekday', 'custom'], default: 'none' })
  repeat_type: string;

  @Prop({ default: 1 })
  repeat_interval?: number;

  @Prop({ type: [Number] })
  repeat_days?: number[];

  @Prop({ enum: ['never', 'on', 'after'], default: 'never' })
  repeat_end_type?: string;

  @Prop()
  repeat_end_date?: Date;

  @Prop()
  repeat_occurrences?: number;

  @Prop()
  location?: string;

  @Prop({ type: [String], default: [] })
  guests?: string[];
}

export const TaskEventSchema = SchemaFactory.createForClass(TaskEvent);
