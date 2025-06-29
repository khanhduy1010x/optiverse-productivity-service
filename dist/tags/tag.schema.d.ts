import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type TagDocument = Tag & Document;
export declare class Tag {
    _id: mongoose.Types.ObjectId;
    user_id: Types.ObjectId;
    name: string;
    color?: string;
}
export declare const TagSchema: mongoose.Schema<Tag, mongoose.Model<Tag, any, any, any, Document<unknown, any, Tag, any> & Tag & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Tag, Document<unknown, {}, mongoose.FlatRecord<Tag>, {}> & mongoose.FlatRecord<Tag> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
