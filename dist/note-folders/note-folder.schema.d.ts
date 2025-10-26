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
    isShared?: boolean;
    sharedBy?: string;
    permission?: 'view' | 'edit';
    sharedWith?: SharedUser[];
    owner_info?: UserInfo;
}
export interface NoteWithType extends Note {
    type: 'file';
    isShared?: boolean;
    sharedBy?: string;
    permission?: 'view' | 'edit';
    sharedWith?: SharedUser[];
    owner_info?: UserInfo;
}
export type RootItem = NoteFolderTree | NoteWithType;
export declare class NoteFolder {
    _id: mongoose.Types.ObjectId;
    user_id: Types.ObjectId;
    parent_folder_id?: Types.ObjectId;
    name: string;
}
export declare const NoteFolderSchema: mongoose.Schema<NoteFolder, mongoose.Model<NoteFolder, any, any, any, Document<unknown, any, NoteFolder, any> & NoteFolder & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, NoteFolder, Document<unknown, {}, mongoose.FlatRecord<NoteFolder>, {}> & mongoose.FlatRecord<NoteFolder> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
