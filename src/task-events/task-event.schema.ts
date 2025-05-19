import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type TaskEventDocument = TaskEvent & Document;

@Schema({ timestamps: true })
export class TaskEvent {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Task' })
  task_id: Types.ObjectId;

  @Prop({ required: true })
  start_time: Date;

  @Prop()
  end_time?: Date;

  @Prop({ enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'], default: 'none' })
  repeat_type: string;

  @Prop()
  repeat_interval?: number;

  @Prop()
  repeat_end_date?: Date;
}

export const TaskEventSchema = SchemaFactory.createForClass(TaskEvent);
