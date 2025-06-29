import { Model } from 'mongoose';
import { ReviewSession } from './review-session.schema';
export declare class ReviewSessionRepository {
    private readonly reviewSessionModel;
    constructor(reviewSessionModel: Model<ReviewSession>);
    findByUserAndFlashcard(userId: string, flashcardId: string): Promise<ReviewSession | null>;
    updateByUserAndFlashcard(userId: string, flashcardId: string, data: Partial<ReviewSession>): Promise<ReviewSession>;
    createReviewSession(sessionData: Partial<ReviewSession>): Promise<ReviewSession>;
    getReviewSessionsByUserID(userId: string): Promise<ReviewSession[]>;
    deleteReviewSessionByFlashcardId(flashcardId: string): Promise<void>;
}
