import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { WorkspacePermissionSchema } from './workspace_permission.schema';

export type WorkspaceNotePermissionDocument = WorkspaceNotePermission &
  Document;

@Schema({ timestamps: true })
export class WorkspaceNotePermission {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Workspace' })
  workspace_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({
    type: [String],
    enum: ['NOTE_ADMIN', 'NOTE_USER'],
    default: ['NOTE_USER'],
  })
  actions: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const WorkspaceNotePermissionSchema = SchemaFactory.createForClass(
  WorkspaceNotePermission,
);

WorkspaceNotePermissionSchema.index(
  { workspace_id: 1, user_id: 1 },
  { unique: true },
);
