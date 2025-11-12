import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkspaceTaskQuotaDocument = WorkspaceTaskQuota & Document;

@Schema({ timestamps: true })
export class WorkspaceTaskQuota {
  @Prop({ type: Types.ObjectId, required: true })
  workspace_id: Types.ObjectId;

  // quota_date: YYYY-MM-DD at 00:00:00 - serves as unique key per workspace per day
  @Prop({ type: Date, required: true })
  quota_date: Date;

  @Prop({ type: Number, required: true, default: 0 })
  created_count: number; // Total number of tasks created on this date in this workspace

  @Prop({ type: Date, default: () => new Date() })
  created_at: Date;

  @Prop({ type: Date, default: () => new Date() })
  updated_at: Date;
}

export const WorkspaceTaskQuotaSchema = SchemaFactory.createForClass(WorkspaceTaskQuota);

// Create compound unique index: one quota record per workspace per day
WorkspaceTaskQuotaSchema.index({ workspace_id: 1, quota_date: 1 }, { unique: true });
