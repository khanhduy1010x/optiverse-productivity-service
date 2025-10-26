import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type NoteDocument = Note & Document;
export declare class Note {
    _id: mongoose.Types.ObjectId;
    user_id: Types.ObjectId;
    folder_id?: Types.ObjectId;
    title: string;
    content?: string;
}
export declare const NoteSchema: mongoose.Schema<Note, mongoose.Model<Note, any, any, any, Document<unknown, any, Note, any> & Note & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Note, Document<unknown, {}, mongoose.FlatRecord<Note>, {}> & mongoose.FlatRecord<Note> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
