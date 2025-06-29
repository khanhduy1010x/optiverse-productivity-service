import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type AchievementDocument = Achievement & Document;
export declare class Achievement {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    icon_url?: string;
    created_at: Date;
    updated_at: Date;
}
export declare const AchievementSchema: mongoose.Schema<Achievement, mongoose.Model<Achievement, any, any, any, Document<unknown, any, Achievement, any> & Achievement & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Achievement, Document<unknown, {}, mongoose.FlatRecord<Achievement>, {}> & mongoose.FlatRecord<Achievement> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
