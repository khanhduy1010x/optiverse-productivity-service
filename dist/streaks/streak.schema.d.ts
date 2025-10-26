import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type StreakDocument = Streak & Document;
export declare class Streak {
    _id: mongoose.Types.ObjectId;
    user_id: Types.ObjectId;
    loginStreak: number;
    lastLoginDate: Date;
    taskStreak: number;
    lastTaskDate: Date;
    flashcardStreak: number;
    lastFlashcardDate: Date;
}
export declare const StreakSchema: mongoose.Schema<Streak, mongoose.Model<Streak, any, any, any, Document<unknown, any, Streak, any> & Streak & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Streak, Document<unknown, {}, mongoose.FlatRecord<Streak>, {}> & mongoose.FlatRecord<Streak> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
