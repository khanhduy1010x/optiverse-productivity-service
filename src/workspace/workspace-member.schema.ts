import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type WorkspaceMemberDocument = WorkspaceMember & Document;

@Schema({ timestamps: true })
export class WorkspaceMember {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Workspace' })
  workspace_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ enum: ['admin', 'user'], default: 'user' })
  role: string;

  @Prop({
    type: [String],
    enum: [
      'RENAME_WORKSPACE',
      'EDIT_DESCRIPTION',
      'MANAGE_PASSWORD',
      'MANAGE_MEMBERS',
      'ACCEPT_MEMBER',
    ],
    default: [],
  })
  permissions: string[];

  @Prop({ enum: ['active', 'banned'], default: 'active' })
  status: string;

  @Prop({ default: Date.now })
  joined_at: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WorkspaceMemberSchema =
  SchemaFactory.createForClass(WorkspaceMember);

// Compound index to ensure one user can only be a member once per workspace
WorkspaceMemberSchema.index({ workspace_id: 1, user_id: 1 }, { unique: true });
// Index for user's workspaces lookup
WorkspaceMemberSchema.index({ user_id: 1 });
// Index for workspace's members lookup
WorkspaceMemberSchema.index({ workspace_id: 1 });
