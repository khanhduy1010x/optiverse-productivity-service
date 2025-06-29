import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type ReviewSessionDocument = ReviewSession & Document;
export declare class ReviewSession {
    _id: mongoose.Types.ObjectId;
    flashcard_id: Types.ObjectId;
    user_id: Types.ObjectId;
    last_review: Date;
    next_review: Date;
    interval: number;
    ease_factor: number;
    repetition_count: number;
    quality: number;
}
export declare const ReviewSessionSchema: mongoose.Schema<ReviewSession, mongoose.Model<ReviewSession, any, any, any, Document<unknown, any, ReviewSession, any> & ReviewSession & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ReviewSession, Document<unknown, {}, mongoose.FlatRecord<ReviewSession>, {}> & mongoose.FlatRecord<ReviewSession> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
