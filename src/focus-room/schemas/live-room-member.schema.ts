import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type LiveRoomMemberDocument = LiveRoomMember & Document;

export enum MemberRole {
  HOST = 'host',
  COHOST = 'cohost',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum MemberStatus {
  JOINED = 'joined',
  LEFT = 'left',
  BANNED = 'banned',
}

@Schema({ timestamps: true })
export class LiveRoomMember {
  @Prop({ required: true, type: Types.ObjectId, ref: 'LiveRoom' })
  room_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ type: String, enum: MemberRole, default: MemberRole.MEMBER })
  role: MemberRole;

  @Prop({ type: String, enum: MemberStatus, default: MemberStatus.JOINED })
  status: MemberStatus;

  @Prop({ type: Date })
  joined_at: Date;

  @Prop({ nullable: true, type: Date })
  left_at?: Date;

  @Prop({ type: Date, default: () => new Date() })
  createdAt: Date;

  @Prop({ type: Date, default: () => new Date() })
  updatedAt: Date;
}

export const LiveRoomMemberSchema =
  SchemaFactory.createForClass(LiveRoomMember);

// Compound index để tìm member nhanh
LiveRoomMemberSchema.index({ room_id: 1, user_id: 1 }, { unique: true });
