import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum RecordingStatus {
  RECORDING = 'RECORDING',
  ENDED = 'ENDED',
}

export type LiveRoomRecordDocument = LiveRoomRecord & Document;

@Schema({ timestamps: true })
export class LiveRoomRecord {
  @Prop({ required: true, type: Types.ObjectId, ref: 'LiveRoom' })
  room_id: Types.ObjectId;

  @Prop({ required: true, type: String, unique: true })
  egress_id: string;

  @Prop({ type: String, unique: true, default: 'Untitled recording' })
  title: string;

  @Prop({ nullable: true, type: String })
  gcp_url?: string;

  @Prop({
    type: String,
    enum: RecordingStatus,
    default: RecordingStatus.RECORDING,
  })
  status: RecordingStatus;

  @Prop({ type: Date })
  started_at: Date;

  @Prop({ nullable: true, type: Date })
  ended_at?: Date;

  @Prop({ type: Date, default: () => new Date() })
  createdAt: Date;

  @Prop({ type: Date, default: () => new Date() })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isSummarized: boolean;

  @Prop({ type: String, nullable: true })
  summarizedContent?: string;
}

export const LiveRoomRecordSchema =
  SchemaFactory.createForClass(LiveRoomRecord);

LiveRoomRecordSchema.index({ room_id: 1, status: 1 });
LiveRoomRecordSchema.index({ egress_id: 1 });
LiveRoomRecordSchema.index({ title: 1 });
