import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type LiveRoomJoinRequestDocument = LiveRoomJoinRequest & Document;

export enum JoinRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class LiveRoomJoinRequest {
  @Prop({ required: true, type: Types.ObjectId, ref: 'LiveRoom' })
  room_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({
    type: String,
    enum: JoinRequestStatus,
    default: JoinRequestStatus.PENDING,
  })
  status: JoinRequestStatus;

  @Prop({ nullable: true, type: Types.ObjectId, ref: 'User' })
  responded_by?: Types.ObjectId;

  @Prop({ nullable: true, type: String })
  rejection_reason?: string;

  @Prop({ type: Date, default: () => new Date() })
  requested_at: Date;

  @Prop({ nullable: true, type: Date })
  responded_at?: Date;

  @Prop({ type: Date, default: () => new Date() })
  createdAt: Date;

  @Prop({ type: Date, default: () => new Date() })
  updatedAt: Date;
}

export const LiveRoomJoinRequestSchema =
  SchemaFactory.createForClass(LiveRoomJoinRequest);

// Index để tìm pending requests nhanh
LiveRoomJoinRequestSchema.index({ room_id: 1, status: 1 });
LiveRoomJoinRequestSchema.index({ user_id: 1, status: 1 });
