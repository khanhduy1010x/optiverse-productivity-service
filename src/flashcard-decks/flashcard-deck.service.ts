import { FlashcardService } from './../flashcards/flashcard.service';
import { Injectable } from '@nestjs/common';
import { FlashcardDeckRepository } from './flashcard-deck.repository';
import { FlashcardDeck } from './flashcard-deck.schema';
import { CreateFlashcardDeckRequest } from './dto/request/CreateFlashcardDeckRequest.dto';
import { UpdateFlashcardDeckRequest } from './dto/request/UpdateFlashcardDeckRequest.dto';
import { FlashcardDeckResponse } from './dto/response/FlashcardDeckResponse.dto';
import { FlashcardRepository } from '../flashcards/flashcard.repository';
import { PdfProcessingService } from './services/pdf-processing.service';
import { GoogleGenAiService } from './services/google-genai.service';
import { GeneratedFlashcardsResponse } from './dto/response/GeneratedFlashcardsResponse.dto';

@Injectable()
export class FlashcardDeckService {
  constructor(
    private readonly flashcardDeckRepository: FlashcardDeckRepository,
    private readonly flashcardService: FlashcardService,
    private readonly pdfProcessingService: PdfProcessingService,
    private readonly googleGenAiService: GoogleGenAiService,
  ) {}

  async getFlashcardDecksByUserID(userId: string): Promise<FlashcardDeckResponse[]> {
    return await this.flashcardDeckRepository.getFlashcardDecksByUserID(userId);
  }

  async getFlashcardDecksByWorkspaceID(workspaceId: string): Promise<FlashcardDeckResponse[]> {
    return await this.flashcardDeckRepository.getFlashcardDecksByWorkspaceID(workspaceId);
  }

  async getStatisticsByUserID(userId: string): Promise<any> {
    return await this.flashcardDeckRepository.getStatisticsByUserID(userId);
  }

  async getDueTodayPerDeck(userId: string): Promise<any> {
    return await this.flashcardDeckRepository.getDueTodayPerDeck(userId);
  }

  async getReviewsByDayByUserID(userId: string): Promise<any> {
    return await this.flashcardDeckRepository.getReviewsByDay(userId);
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

  async duplicateFlashcardDeck(deckId: string, userId: string): Promise<FlashcardDeckResponse> {
    // Lấy thông tin deck gốc
    const originalDeck = await this.flashcardDeckRepository.getFlashcardDeckById(deckId);
    if (!originalDeck) {
      throw new Error('Deck not found');
    }
    // Tạo deck mới với title thêm hậu tố "(Copy)"
    const newDeck = await this.flashcardDeckRepository.createFlashcardDeck(
      {
        title: originalDeck.flashcardDeck.title + ' (Copy)',
      },
      userId,
    );
    // Lấy toàn bộ flashcard của deck gốc
    const flashcards = await this.flashcardService.getFlashcardsByDeckID(deckId);
    // Tạo flashcard mới cho deck mới
    for (const fc of flashcards) {
      await this.flashcardService.createFlashcard(userId, {
        deck_id: newDeck._id,
        front: fc.front,
        back: fc.back,
      });
    }
    return new FlashcardDeckResponse(newDeck);
  }

  async getStatisticsByWorkspaceID(workspaceId: string, userId: string): Promise<any> {
    return await this.flashcardDeckRepository.getStatisticsByWorkspaceID(workspaceId, userId);
  }

  async getDueTodayPerDeckByWorkspace(workspaceId: string, userId: string): Promise<any> {
    return await this.flashcardDeckRepository.getDueTodayPerDeckByWorkspace(workspaceId, userId);
  }

  async getReviewsByDayByWorkspace(workspaceId: string, userId: string): Promise<any> {
    return await this.flashcardDeckRepository.getReviewsByDayByWorkspace(workspaceId, userId);
  }

  /**
   * Generate flashcards from a PDF file using Google Generative AI
   * @param pdfBuffer The PDF file as a buffer
   * @param deckTitle Title for the new flashcard deck
   * @param userId User ID who owns the deck
   * @param description Optional description for the deck
   * @param workspaceId Optional workspace ID
   * @param numFlashcards Number of flashcards to generate
   * @returns The created deck and generated flashcards
   */
  async generateFlashcardsFromPdf(
    pdfBuffer: Buffer,
    deckTitle: string,
    userId: string,
    description?: string,
    workspaceId?: string,
    numFlashcards: number = 10,
  ): Promise<GeneratedFlashcardsResponse> {
    // Step 1: Extract text from PDF
    const pdfText = await this.pdfProcessingService.extractTextFromPdf(pdfBuffer);
    const cleanedText = this.pdfProcessingService.cleanText(pdfText);

    // Step 2: Generate flashcards using Google GenAI
    const generatedFlashcards = await this.googleGenAiService.generateFlashcardsFromText(
      cleanedText,
      numFlashcards,
    );

    // Step 3: Create a new flashcard deck
    const createDeckDto: CreateFlashcardDeckRequest = {
      title: deckTitle,
      description,
      workspace_id: workspaceId,
    };

    const newDeck = await this.flashcardDeckRepository.createFlashcardDeck(createDeckDto, userId);

    // Step 4: Create flashcards for the deck
    for (const flashcard of generatedFlashcards) {
      await this.flashcardService.createFlashcard(userId, {
        deck_id: newDeck._id,
        front: flashcard.front,
        back: flashcard.back,
      });
    }

    return new GeneratedFlashcardsResponse(
      new FlashcardDeckResponse(newDeck),
      generatedFlashcards,
      `Successfully generated ${generatedFlashcards.length} flashcards from PDF`,
    );
  }
}
