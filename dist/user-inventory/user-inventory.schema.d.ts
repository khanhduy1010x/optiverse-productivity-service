import mongoose, { HydratedDocument, Types } from 'mongoose';
export type UserInventoryDocument = HydratedDocument<UserInventory>;
export type FrameDocument = HydratedDocument<Frame>;
export declare class UserInventory {
    _id: mongoose.Types.ObjectId;
    user_id: Types.ObjectId;
    op: string;
    frame: string[];
}
export declare class Frame {
    _id: mongoose.Types.ObjectId;
    title: string;
    icon_url?: string;
    cost: number;
}
export declare const UserInventorySchema: mongoose.Schema<UserInventory, mongoose.Model<UserInventory, any, any, any, mongoose.Document<unknown, any, UserInventory, any> & UserInventory & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, UserInventory, mongoose.Document<unknown, {}, mongoose.FlatRecord<UserInventory>, {}> & mongoose.FlatRecord<UserInventory> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const FrameSchema: mongoose.Schema<Frame, mongoose.Model<Frame, any, any, any, mongoose.Document<unknown, any, Frame, any> & Frame & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Frame, mongoose.Document<unknown, {}, mongoose.FlatRecord<Frame>, {}> & mongoose.FlatRecord<Frame> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
