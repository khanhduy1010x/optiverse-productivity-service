import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type ShareDocument = Share & Document;

export interface SharedUser {
  user_id: Types.ObjectId;
  permission: string;
  shared_at: Date;
}

@Schema({ timestamps: true })
export class Share {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  owner_id: Types.ObjectId;

  @Prop({ required: true, enum: ['note', 'folder'] })
  resource_type: string;

  @Prop({ required: true, type: Types.ObjectId })
  resource_id: Types.ObjectId;

  @Prop([
    {
      user_id: { type: Types.ObjectId, ref: 'User', required: true },
      permission: { type: String, enum: ['view', 'edit'], required: true },
      shared_at: { type: Date, default: Date.now },
    },
  ])
  shared_with: SharedUser[];
}

export const ShareSchema = SchemaFactory.createForClass(Share);
