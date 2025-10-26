import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type FocusSessionDocument = FocusSession & Document;
export declare class FocusSession {
    _id: mongoose.Types.ObjectId;
    user_id: Types.ObjectId;
    start_time: Date;
    end_time: Date;
}
export declare const FocusSessionSchema: mongoose.Schema<FocusSession, mongoose.Model<FocusSession, any, any, any, Document<unknown, any, FocusSession, any> & FocusSession & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, FocusSession, Document<unknown, {}, mongoose.FlatRecord<FocusSession>, {}> & mongoose.FlatRecord<FocusSession> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
