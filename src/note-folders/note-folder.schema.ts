import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { Note } from '../notes/note.schema';
export type NoteFolderDocument = NoteFolder & Document;

export interface NoteFolderTree extends NoteFolder {
  subfolders: NoteFolderTree[];
  type?: 'folder';
}
export interface NoteWithType extends Note {
  type: 'file';
}
export type RootItem = NoteFolderTree | NoteWithType;
@Schema({ timestamps: true })
export class NoteFolder {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'NoteFolder' })
  parent_folder_id?: Types.ObjectId;

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
