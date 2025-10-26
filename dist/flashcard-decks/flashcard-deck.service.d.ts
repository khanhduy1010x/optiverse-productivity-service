import { FlashcardService } from './../flashcards/flashcard.service';
import { FlashcardDeckRepository } from './flashcard-deck.repository';
import { CreateFlashcardDeckRequest } from './dto/request/CreateFlashcardDeckRequest.dto';
import { UpdateFlashcardDeckRequest } from './dto/request/UpdateFlashcardDeckRequest.dto';
import { FlashcardDeckResponse } from './dto/response/FlashcardDeckResponse.dto';
export declare class FlashcardDeckService {
    private readonly flashcardDeckRepository;
    private readonly flashcardService;
    constructor(flashcardDeckRepository: FlashcardDeckRepository, flashcardService: FlashcardService);
    getFlashcardDecksByUserID(userId: string): Promise<FlashcardDeckResponse[]>;
    getStatisticsByUserID(userId: string): Promise<any>;
    getDueTodayPerDeck(userId: string): Promise<any>;
    getReviewsByDayByUserID(userId: string): Promise<any>;
    getFlashcardDeckById(deckId: string): Promise<FlashcardDeckResponse | null>;
    createFlashcardDeck(createFlashcardDeckDto: CreateFlashcardDeckRequest, userId: string): Promise<FlashcardDeckResponse>;
    updateFlashcardDeck(flashcardDeckId: string, updateFlashcardDeckDto: UpdateFlashcardDeckRequest): Promise<FlashcardDeckResponse>;
    deleteFlashcardDeck(flashcardDeckId: string): Promise<void>;
    duplicateFlashcardDeck(deckId: string, userId: string): Promise<FlashcardDeckResponse>;
}
