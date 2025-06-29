import { Model } from 'mongoose';
import { FlashcardDeck } from './flashcard-deck.schema';
import { CreateFlashcardDeckRequest } from './dto/request/CreateFlashcardDeckRequest.dto';
import { UpdateFlashcardDeckRequest } from './dto/request/UpdateFlashcardDeckRequest.dto';
import { FlashcardDeckResponse } from './dto/response/FlashcardDeckResponse.dto';
export declare class FlashcardDeckRepository {
    private readonly flashcardDeckModel;
    constructor(flashcardDeckModel: Model<FlashcardDeck>);
    getFlashcardDecksByUserID(userId: string): Promise<FlashcardDeckResponse[]>;
    getFlashcardDeckById(deckId: string): Promise<FlashcardDeckResponse | null>;
    buildFlashcardDeckPipeline(matchCondition: object, now: number): any[];
    createFlashcardDeck(createFlashcardDeckDto: CreateFlashcardDeckRequest, userId: string): Promise<FlashcardDeck>;
    updateFlashcardDeck(flashcardDeckId: string, updateFlashcardDeckDto: UpdateFlashcardDeckRequest): Promise<FlashcardDeck>;
    deleteFlashcardDeck(flashcardDeckId: string): Promise<void>;
}
