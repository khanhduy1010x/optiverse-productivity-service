import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type LiveRoomDocument = LiveRoom & Document;

export enum AccessType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Schema({ timestamps: true })
export class LiveRoom {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', nullable: true })
  workspace_id?: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  host_id: Types.ObjectId;

  @Prop({ nullable: true, type: String })
  room_sid?: string;

  @Prop({ type: String, enum: AccessType, default: AccessType.PUBLIC })
  access_type: AccessType;

  @Prop({ nullable: true, type: String })
  password?: string;

  @Prop({ type: Boolean, default: false })
  is_recording: boolean;

  @Prop({ type: Number, default: 0 })
  record_count: number;

  @Prop({ nullable: true, type: String })
  description?: string;

  @Prop({ type: Date })
  created_at: Date;

  @Prop({ type: Date })
  updated_at: Date;
}

export const LiveRoomSchema = SchemaFactory.createForClass(LiveRoom);
