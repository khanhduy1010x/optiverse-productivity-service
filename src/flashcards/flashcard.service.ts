import { Injectable } from '@nestjs/common';
import { FlashcardRepository } from './flashcard.repository';
import { Flashcard } from './flashcard.schema';
import { CreateFlashcardRequest } from './dto/request/CreateFlashcardRequest.dto';
import { UpdateFlashcardRequest } from './dto/request/UpdateFlashcardRequest.dto';
import { FlashcardResponse } from './dto/response/FlashcardResponse.dto';
import { ReviewSessionService } from '../review_sessions/review-session.service';

@Injectable()
export class FlashcardService {
  constructor(
    private readonly flashcardRepository: FlashcardRepository,
    private readonly reviewSessionService: ReviewSessionService,
  ) {}

  async getFlashcardsByDeckID(deckId: string): Promise<Flashcard[]> {
    return await this.flashcardRepository.getFlashcardsByDeckID(deckId);
  }

  async createFlashcard(
    user_id: string,
    createFlashcardDto: CreateFlashcardRequest,
  ): Promise<FlashcardResponse> {
    const flashcard = await this.flashcardRepository.createFlashcard(createFlashcardDto);
    const reviewSession = await this.reviewSessionService.createReviewFlashcard(
      user_id,
      flashcard._id.toString(),
    );
    return new FlashcardResponse(flashcard);
  }

  async updateFlashcard(
    flashcardId: string,
    updateFlashcardDto: UpdateFlashcardRequest,
  ): Promise<FlashcardResponse> {
    const flashcard = await this.flashcardRepository.updateFlashcard(
      flashcardId,
      updateFlashcardDto,
    );
    return new FlashcardResponse(flashcard);
  }

  async deleteFlashcard(flashcardId: string): Promise<void> {
    await this.reviewSessionService.deleteReviewSessionByFlashcardId(flashcardId);
    return await this.flashcardRepository.deleteFlashcard(flashcardId);
  }

  async deleteManyByIds(ids: string[]): Promise<void> {
    return await this.flashcardRepository.deleteManyByIds(ids);
  }
}
