import { Document, Types } from 'mongoose';
export type FriendDocument = Friend & Document;
import mongoose from 'mongoose';
export declare class Friend {
    _id: mongoose.Types.ObjectId;
    user_id: Types.ObjectId;
    friend_id: Types.ObjectId;
    status: string;
}
export declare const FriendSchema: mongoose.Schema<Friend, mongoose.Model<Friend, any, any, any, Document<unknown, any, Friend, any> & Friend & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Friend, Document<unknown, {}, mongoose.FlatRecord<Friend>, {}> & mongoose.FlatRecord<Friend> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
