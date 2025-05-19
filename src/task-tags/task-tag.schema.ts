import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type TaskTagDocument = TaskTag & Document;

@Schema({ timestamps: true })
export class TaskTag {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Task' })
  task: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Tag' })
  tag: Types.ObjectId;
}

export const TaskTagSchema = SchemaFactory.createForClass(TaskTag);
