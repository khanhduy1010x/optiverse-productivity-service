import { Injectable } from '@nestjs/common';
import { ReviewSessionRepository } from './review-session.repository';
import { ReviewSession } from './review-session.schema';
import { CreateReviewSessionRequest } from './dto/request/CreateReviewSessionRequest.dto';
import { UpdateReviewSessionRequest } from './dto/request/UpdateReviewSessionRequest.dto';
import { ReviewSessionResponse } from './dto/response/ReviewSessionResponse.dto';
import { ReviewRequestDto } from './dto/request/ReviewRequest.dto';
import { Types } from 'mongoose';
@Injectable()
export class ReviewSessionService {
  constructor(private readonly reviewSessionRepository: ReviewSessionRepository) {}

  async createReviewFlashcard(user_id: string, flashcard_id: string) {
    const now = new Date();

    const session = {
      flashcard_id: new Types.ObjectId(flashcard_id),
      user_id: new Types.ObjectId(user_id),
      last_review: now,
      next_review: now,
      interval: 0,
      ease_factor: 2.5,
      repetition_count: 0,
      quality: 0,
    };

    const newReviewFlashcard = await this.reviewSessionRepository.createReviewSession(session);

    return new ReviewSessionResponse(newReviewFlashcard);
  }

  async deleteReviewSessionByFlashcardId(flashcardId: string): Promise<void> {
    await this.reviewSessionRepository.deleteReviewSessionByFlashcardId(flashcardId);
  }
}
