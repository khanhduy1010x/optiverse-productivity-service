import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type WorkspaceTaskDocument = WorkspaceTask & Document;

// Main WorkspaceTask Schema
@Schema({ timestamps: true, collection: 'workspace_tasks' })
export class WorkspaceTask {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Workspace' })
  workspace_id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  created_by: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assigned_to?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  assigned_to_list?: Types.ObjectId[];

  @Prop({ default: 'to-do', enum: ['to-do', 'in-progress', 'done'] })
  status: string;

  @Prop()
  completed_at?: Date;

  @Prop()
  end_time?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WorkspaceTaskSchema = SchemaFactory.createForClass(WorkspaceTask);

// Indexes for performance
WorkspaceTaskSchema.index({ workspace_id: 1 });
WorkspaceTaskSchema.index({ assigned_to: 1 });
WorkspaceTaskSchema.index({ assigned_to_list: 1 });
WorkspaceTaskSchema.index({ created_by: 1 });
WorkspaceTaskSchema.index({ workspace_id: 1, status: 1 });
