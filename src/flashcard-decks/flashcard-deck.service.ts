import { FlashcardService } from './../flashcards/flashcard.service';
import { Injectable } from '@nestjs/common';
import { FlashcardDeckRepository } from './flashcard-deck.repository';
import { FlashcardDeck } from './flashcard-deck.schema';
import { CreateFlashcardDeckRequest } from './dto/request/CreateFlashcardDeckRequest.dto';
import { UpdateFlashcardDeckRequest } from './dto/request/UpdateFlashcardDeckRequest.dto';
import { FlashcardDeckResponse } from './dto/response/FlashcardDeckResponse.dto';
import { FlashcardRepository } from '../flashcards/flashcard.repository';

@Injectable()
export class FlashcardDeckService {
  constructor(
    private readonly flashcardDeckRepository: FlashcardDeckRepository,
    private readonly flashcardService: FlashcardService,
  ) {}

  async getFlashcardDecksByUserID(userId: string): Promise<FlashcardDeckResponse[]> {
    return await this.flashcardDeckRepository.getFlashcardDecksByUserID(userId);
  }

  async getFlashcardDeckById(deckId: string): Promise<FlashcardDeckResponse | null> {
    return await this.flashcardDeckRepository.getFlashcardDeckById(deckId);
  }

  async createFlashcardDeck(
    createFlashcardDeckDto: CreateFlashcardDeckRequest,
    userId: string,
  ): Promise<FlashcardDeckResponse> {
    const flashcardDeck = await this.flashcardDeckRepository.createFlashcardDeck(
      createFlashcardDeckDto,
      userId,
    );
    return new FlashcardDeckResponse(flashcardDeck);
  }

  async updateFlashcardDeck(
    flashcardDeckId: string,
    updateFlashcardDeckDto: UpdateFlashcardDeckRequest,
  ): Promise<FlashcardDeckResponse> {
    const flashcardDeck = await this.flashcardDeckRepository.updateFlashcardDeck(
      flashcardDeckId,
      updateFlashcardDeckDto,
    );
    return new FlashcardDeckResponse(flashcardDeck);
  }

  async deleteFlashcardDeck(flashcardDeckId: string): Promise<void> {
    const flashcards = await this.flashcardService.getFlashcardsByDeckID(flashcardDeckId);
    const ids = flashcards.map((flashcard) => flashcard._id.toString());
    await this.flashcardService.deleteManyByIds(ids);
    await this.flashcardDeckRepository.deleteFlashcardDeck(flashcardDeckId);
  }
}
