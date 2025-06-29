import { FlashcardDeckService } from './flashcard-deck.service';
import { ApiResponse } from 'src/common/api-response';
import { FlashcardDeckResponse } from './dto/response/FlashcardDeckResponse.dto';
import { CreateFlashcardDeckRequest } from './dto/request/CreateFlashcardDeckRequest.dto';
import { UpdateFlashcardDeckRequest } from './dto/request/UpdateFlashcardDeckRequest.dto';
import { FlashcardDeck } from './flashcard-deck.schema';
export declare class FlashcardDeckController {
    private readonly flashcardDeckService;
    constructor(flashcardDeckService: FlashcardDeckService);
    getFlashcardDecksByUserID(req: any): Promise<ApiResponse<FlashcardDeck[]>>;
    getFlashcardDeckById(flashcardDeckId: string): Promise<ApiResponse<FlashcardDeck | null>>;
    createFlashcardDeck(req: any, createFlashcardDeckDto: CreateFlashcardDeckRequest): Promise<ApiResponse<FlashcardDeckResponse>>;
    updateFlashcardDeck(flashcardDeckId: string, updateFlashcardDeckDto: UpdateFlashcardDeckRequest): Promise<ApiResponse<FlashcardDeckResponse>>;
    deleteFlashcardDeck(flashcardDeckId: string): Promise<ApiResponse<void>>;
}
