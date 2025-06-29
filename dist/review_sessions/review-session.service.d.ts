import { ReviewSessionRepository } from './review-session.repository';
import { ReviewSession } from './review-session.schema';
import { ReviewSessionResponse } from './dto/response/ReviewSessionResponse.dto';
import { ReviewRequestDto } from './dto/request/ReviewRequest.dto';
export declare class ReviewSessionService {
    private readonly reviewSessionRepository;
    constructor(reviewSessionRepository: ReviewSessionRepository);
    createReviewFlashcard(user_id: string, flashcard_id: string): Promise<ReviewSessionResponse>;
    reviewFlashcard(userId: string, dto: ReviewRequestDto): Promise<ReviewSessionResponse | null>;
    getReviewSessionsByUserID(userId: string): Promise<ReviewSession[]>;
    deleteReviewSessionByFlashcardId(flashcardId: string): Promise<void>;
}
