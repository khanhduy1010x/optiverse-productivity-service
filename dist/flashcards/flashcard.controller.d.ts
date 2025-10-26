import { FlashcardService } from './flashcard.service';
import { ApiResponse } from 'src/common/api-response';
import { FlashcardResponse } from './dto/response/FlashcardResponse.dto';
import { CreateFlashcardRequest } from './dto/request/CreateFlashcardRequest.dto';
import { UpdateFlashcardRequest } from './dto/request/UpdateFlashcardRequest.dto';
export declare class FlashcardController {
    private readonly flashcardService;
    constructor(flashcardService: FlashcardService);
    createFlashcard(req: any, createFlashcardDto: CreateFlashcardRequest): Promise<ApiResponse<FlashcardResponse>>;
    updateFlashcard(flashcardId: string, updateFlashcardDto: UpdateFlashcardRequest): Promise<ApiResponse<FlashcardResponse>>;
    deleteFlashcard(flashcardId: string): Promise<ApiResponse<void>>;
}
