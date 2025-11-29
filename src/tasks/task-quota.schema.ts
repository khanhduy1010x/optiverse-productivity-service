import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskQuotaDocument = TaskQuota & Document;

@Schema({ timestamps: true })
export class TaskQuota {
  @Prop({ type: Types.ObjectId, required: true })
  user_id: Types.ObjectId;

  // Use compound unique index (user_id + quota_date) defined below; quota_date itself must remain non-unique
  @Prop({ type: Date, required: true })
  quota_date: Date; // YYYY-MM-DD at 00:00:00 - serves as unique key per user per day

  @Prop({ type: Number, required: true, default: 0 })
  created_count: number; // Total number of tasks created on this date (add + import)

  @Prop({ type: Date, default: () => new Date() })
  created_at: Date;

  @Prop({ type: Date, default: () => new Date() })
  updated_at: Date;
}

export const TaskQuotaSchema = SchemaFactory.createForClass(TaskQuota);

// Create compound unique index for user_id + quota_date (one quota record per user per day)
TaskQuotaSchema.index({ user_id: 1, quota_date: 1 }, { unique: true });
