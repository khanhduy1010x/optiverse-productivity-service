import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { Note } from '../notes/note.schema';
export type NoteFolderDocument = NoteFolder & Document;

export interface UserInfo {
  id?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}

export interface SharedUser {
  user_id: string;
  permission: string;
  shared_at: Date;
  user_info?: UserInfo | null;
}

export interface NoteFolderTree extends NoteFolder {
  subfolders: NoteFolderTree[];
  files?: NoteWithType[];
  type?: 'folder';
  // Thông tin về chia sẻ
  isShared?: boolean;
  sharedBy?: string;
  permission?: 'view' | 'edit';
  sharedWith?: SharedUser[];
  owner_info?: UserInfo;
}
export interface NoteWithType extends Note {
  type: 'file';
  // Thông tin về chia sẻ
  isShared?: boolean;
  sharedBy?: string;
  permission?: 'view' | 'edit';
  sharedWith?: SharedUser[];
  owner_info?: UserInfo;
}
export type RootItem = NoteFolderTree | NoteWithType;
@Schema({ timestamps: true })
export class NoteFolder {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId, ref: 'User' })
  user_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'NoteFolder' })
  parent_folder_id?: Types.ObjectId;
  @Prop({ required: true, type: Types.ObjectId, ref: 'LiveRoom' })
  live_room_id?: Types.ObjectId;

  @Prop({ required: true })
  name: string;
}

export const NoteFolderSchema = SchemaFactory.createForClass(NoteFolder);

NoteFolderSchema.virtual('files', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'folder_id',
  justOne: false,
});
