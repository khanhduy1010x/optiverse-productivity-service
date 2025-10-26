import { Types } from 'mongoose';
export declare class CreateReviewSessionRequest {
    flashcard_id: Types.ObjectId;
    user_id: Types.ObjectId;
    last_review: Date;
    next_review: Date;
    interval: number;
    ease_factor: number;
    repetition_count: number;
    quality: number;
}
