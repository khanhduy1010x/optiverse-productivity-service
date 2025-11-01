import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type WorkspacePermissionDocument = WorkspacePermission & Document;

@Schema({ timestamps: true })
export class WorkspacePermission {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Workspace' })
  workspace_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({
    type: [String],
    enum: ['ROOM_ADMIN', 'ROOM_USER'],
    default: ['ROOM_USER'],
  })
  actions: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const WorkspacePermissionSchema =
  SchemaFactory.createForClass(WorkspacePermission);

WorkspacePermissionSchema.index(
  { workspace_id: 1, user_id: 1, module: 1 },
  { unique: true },
);
