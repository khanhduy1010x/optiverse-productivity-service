import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type UserAchievementDocument = UserAchievement & Document;
export declare class UserAchievement {
    _id: mongoose.Types.ObjectId;
    user_id: Types.ObjectId;
    achievement_id: string;
    unlocked_at: Date;
}
export declare const UserAchievementSchema: mongoose.Schema<UserAchievement, mongoose.Model<UserAchievement, any, any, any, Document<unknown, any, UserAchievement, any> & UserAchievement & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, UserAchievement, Document<unknown, {}, mongoose.FlatRecord<UserAchievement>, {}> & mongoose.FlatRecord<UserAchievement> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
