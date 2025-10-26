import { Types } from 'mongoose';
export declare class CreateFlashcardRequest {
    deck_id: Types.ObjectId;
    front: string;
    back: string;
}
