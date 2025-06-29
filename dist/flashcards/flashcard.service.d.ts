import { FlashcardRepository } from './flashcard.repository';
import { Flashcard } from './flashcard.schema';
import { CreateFlashcardRequest } from './dto/request/CreateFlashcardRequest.dto';
import { UpdateFlashcardRequest } from './dto/request/UpdateFlashcardRequest.dto';
import { FlashcardResponse } from './dto/response/FlashcardResponse.dto';
import { ReviewSessionService } from '../review_sessions/review-session.service';
export declare class FlashcardService {
    private readonly flashcardRepository;
    private readonly reviewSessionService;
    constructor(flashcardRepository: FlashcardRepository, reviewSessionService: ReviewSessionService);
    getFlashcardsByDeckID(deckId: string): Promise<Flashcard[]>;
    createFlashcard(user_id: string, createFlashcardDto: CreateFlashcardRequest): Promise<FlashcardResponse>;
    updateFlashcard(flashcardId: string, updateFlashcardDto: UpdateFlashcardRequest): Promise<FlashcardResponse>;
    deleteFlashcard(flashcardId: string): Promise<void>;
    deleteManyByIds(ids: string[]): Promise<void>;
}
