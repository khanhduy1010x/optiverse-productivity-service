import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type WorkspaceJoinRequestDocument = WorkspaceJoinRequest & Document;

@Schema({ timestamps: true })
export class WorkspaceJoinRequest {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Workspace' })
  workspace_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  target_user_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  requester_id: Types.ObjectId;

  @Prop({ enum: ['invite', 'request'], required: true })
  type: 'invite' | 'request';

  @Prop({ trim: true })
  message?: string;

  @Prop({ type: Date })
  responded_at?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WorkspaceJoinRequestSchema =
  SchemaFactory.createForClass(WorkspaceJoinRequest);

WorkspaceJoinRequestSchema.index(
  { workspace_id: 1, target_user_id: 1, type: 1 },
  { unique: true },
);

// Tăng tốc truy vấn cho workspace và user
WorkspaceJoinRequestSchema.index({ workspace_id: 1 });
WorkspaceJoinRequestSchema.index({ target_user_id: 1 });
WorkspaceJoinRequestSchema.index({ requester_id: 1 });
