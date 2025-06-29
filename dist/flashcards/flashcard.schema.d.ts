import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type FlashcardDocument = Flashcard & Document;
export declare class Flashcard {
    _id: mongoose.Types.ObjectId;
    deck_id: Types.ObjectId;
    front: string;
    back: string;
}
export declare const FlashcardSchema: mongoose.Schema<Flashcard, mongoose.Model<Flashcard, any, any, any, Document<unknown, any, Flashcard, any> & Flashcard & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Flashcard, Document<unknown, {}, mongoose.FlatRecord<Flashcard>, {}> & mongoose.FlatRecord<Flashcard> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
