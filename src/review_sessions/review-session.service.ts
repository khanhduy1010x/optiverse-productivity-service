import { Injectable } from '@nestjs/common';
import { ReviewSessionRepository } from './review-session.repository';
import { ReviewSession } from './review-session.schema';
import { CreateReviewSessionRequest } from './dto/request/CreateReviewSessionRequest.dto';
import { UpdateReviewSessionRequest } from './dto/request/UpdateReviewSessionRequest.dto';
import { ReviewSessionResponse } from './dto/response/ReviewSessionResponse.dto';
import { ReviewRequestDto } from './dto/request/ReviewRequest.dto';
import { Types } from 'mongoose';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
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
  async reviewFlashcard(
    userId: string,
    dto: ReviewRequestDto,
  ): Promise<ReviewSessionResponse | null> {
    console.log('Review flashcard called with:', { userId, dto });
    
    // Validate input
    if (!dto.flashcard_id || dto.quality === undefined || dto.quality === null) {
      throw new AppException(ErrorCode.INVALID_CODE);
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(dto.flashcard_id)) {
      throw new AppException(ErrorCode.INVALID_OBJECT_ID);
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppException(ErrorCode.INVALID_OBJECT_ID);
    }
    
    const existing = await this.reviewSessionRepository.findByUserAndFlashcard(
      userId,
      dto.flashcard_id,
    );
    const now = new Date();
    console.log('Existing session:', existing);
    console.log('DTO quality:', dto.quality);
    const session = existing ?? {
      flashcard_id: new Types.ObjectId(dto.flashcard_id),
      user_id: new Types.ObjectId(userId),
      last_review: now,
      next_review: now,
      interval: 0,
      ease_factor: 2.5,
      repetition_count: 0,
      quality: dto.quality,
    };

    const q = dto.quality;
    const EF_MIN = 1.3;

    if (q === 0) {
      session.repetition_count = 0;
      session.interval = 0;
    } else {
      session.repetition_count += 1;

      if (session.repetition_count === 1) session.interval = 1;
      else if (session.repetition_count === 2) session.interval = 6;
      else session.interval = Math.round(session.interval * session.ease_factor);

      session.ease_factor += 0.1 - (3 - q) * (0.05 + (3 - q) * 0.02);
      if (session.ease_factor < EF_MIN) session.ease_factor = EF_MIN;
    }

    session.last_review = now;
    const millisecondsUntilNextReview =
      session.interval === 0 ? 1 * 60 * 1000 : session.interval * 24 * 60 * 60 * 1000;

    session.next_review = new Date(now.getTime() + millisecondsUntilNextReview);

    session.quality = q;

    const saved = existing
      ? await this.reviewSessionRepository.updateByUserAndFlashcard(
          userId,
          dto.flashcard_id,
          session,
        )
      : await this.reviewSessionRepository.createReviewSession(session);

    return new ReviewSessionResponse(saved);
  }
  async getReviewSessionsByUserID(userId: string): Promise<ReviewSession[]> {
    return await this.reviewSessionRepository.getReviewSessionsByUserID(userId);
  }
  async deleteReviewSessionByFlashcardId(flashcardId: string): Promise<void> {
    await this.reviewSessionRepository.deleteReviewSessionByFlashcardId(flashcardId);
  }
}
