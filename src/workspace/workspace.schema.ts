import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type WorkspaceDocument = Workspace & Document;

@Schema({ timestamps: true })
export class Workspace {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;
  
  @Prop()
  password?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  owner_id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  invite_code: string;

  @Prop({ default: 1 })
  member_count: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);

// Index for invite_code lookups
WorkspaceSchema.index({ invite_code: 1 });
// Index for owner queries
WorkspaceSchema.index({ owner_id: 1 });
