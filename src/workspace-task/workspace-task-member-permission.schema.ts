import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { TaskPermissionType, TaskRolePreset } from './task-permission.enum';

export type WorkspaceTaskMemberPermissionDocument = WorkspaceTaskMemberPermission & Document;

/**
 * WorkspaceTaskMemberPermission Schema
 * Stores per-member permissions for a specific task
 */
@Schema({ timestamps: true, collection: 'workspace_task_member_permissions' })
export class WorkspaceTaskMemberPermission {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'WorkspaceTask', index: true })
  task_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  member_id: Types.ObjectId;

  @Prop({ required: true, type: String, enum: Object.values(TaskRolePreset) })
  role: TaskRolePreset;

  @Prop({ type: [String], enum: Object.values(TaskPermissionType), default: [] })
  permissions: TaskPermissionType[];

  @Prop({ default: false })
  is_owner: boolean; // Indicates if this member is the task owner

  @Prop({ type: Types.ObjectId, ref: 'User' })
  granted_by: Types.ObjectId; // User who granted permissions

  createdAt?: Date;
  updatedAt?: Date;
}

export const WorkspaceTaskMemberPermissionSchema = SchemaFactory.createForClass(
  WorkspaceTaskMemberPermission,
);

// Indexes for performance
WorkspaceTaskMemberPermissionSchema.index({ task_id: 1, member_id: 1 }, { unique: true });
WorkspaceTaskMemberPermissionSchema.index({ task_id: 1 });
WorkspaceTaskMemberPermissionSchema.index({ member_id: 1 });
