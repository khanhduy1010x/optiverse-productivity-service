import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type ShareDocument = Share & Document;
export interface SharedUser {
    user_id: Types.ObjectId;
    permission: string;
    shared_at: Date;
}
export declare class Share {
    _id: mongoose.Types.ObjectId;
    owner_id: Types.ObjectId;
    resource_type: string;
    resource_id: Types.ObjectId;
    shared_with: SharedUser[];
}
export declare const ShareSchema: mongoose.Schema<Share, mongoose.Model<Share, any, any, any, Document<unknown, any, Share, any> & Share & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Share, Document<unknown, {}, mongoose.FlatRecord<Share>, {}> & mongoose.FlatRecord<Share> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
