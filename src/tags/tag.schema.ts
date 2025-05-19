import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type TagDocument = Tag & Document;

@Schema({ timestamps: true })
export class Tag {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '#000000' })
  color?: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

TagSchema.virtual('tasks', {
  ref: 'TaskTag',
  localField: '_id',
  foreignField: 'tag',
  justOne: false,
  options: { populate: { path: 'task' } }, // Lấy đầy đủ thông tin task
});

TagSchema.set('toObject', { virtuals: true });
TagSchema.set('toJSON', { virtuals: true });
