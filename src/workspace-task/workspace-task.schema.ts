import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type WorkspaceTaskDocument = WorkspaceTask & Document;

export type SubtaskDocument = Subtask & Document;

// Subtask Schema (embedded in WorkspaceTask)
@Schema({ _id: true, timestamps: true })
export class Subtask {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  assigned_to: Types.ObjectId;

  @Prop({ default: 'to-do', enum: ['to-do', 'in-progress', 'done'] })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  completed_by?: Types.ObjectId;

  @Prop()
  completed_at?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SubtaskSchema = SchemaFactory.createForClass(Subtask);

// Main WorkspaceTask Schema
@Schema({ timestamps: true })
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

  @Prop({ default: 'to-do', enum: ['to-do', 'in-progress', 'done'] })
  status: string;

  // Embedded subtasks
  @Prop({ type: [SubtaskSchema], default: [] })
  subtasks: Subtask[];

  @Prop({ default: 0 })
  subtask_completed_count: number;

  @Prop()
  completed_at?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WorkspaceTaskSchema = SchemaFactory.createForClass(WorkspaceTask);

// Indexes for performance
WorkspaceTaskSchema.index({ workspace_id: 1 });
WorkspaceTaskSchema.index({ assigned_to: 1 });
WorkspaceTaskSchema.index({ created_by: 1 });
WorkspaceTaskSchema.index({ workspace_id: 1, status: 1 });
