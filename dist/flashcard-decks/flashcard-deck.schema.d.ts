import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type FlashcardDeckDocument = FlashcardDeck & Document;
export declare class FlashcardDeck {
    _id: mongoose.Types.ObjectId;
    user_id: Types.ObjectId;
    title: string;
    description?: string;
}
export declare const FlashcardDeckSchema: mongoose.Schema<FlashcardDeck, mongoose.Model<FlashcardDeck, any, any, any, Document<unknown, any, FlashcardDeck, any> & FlashcardDeck & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, FlashcardDeck, Document<unknown, {}, mongoose.FlatRecord<FlashcardDeck>, {}> & mongoose.FlatRecord<FlashcardDeck> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
