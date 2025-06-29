import { Model } from 'mongoose';
import { Flashcard } from './flashcard.schema';
import { CreateFlashcardRequest } from './dto/request/CreateFlashcardRequest.dto';
import { UpdateFlashcardRequest } from './dto/request/UpdateFlashcardRequest.dto';
export declare class FlashcardRepository {
    private readonly flashcardModel;
    constructor(flashcardModel: Model<Flashcard>);
    getFlashcardsByDeckID(deckId: string): Promise<Flashcard[]>;
    createFlashcard(createFlashcardDto: CreateFlashcardRequest): Promise<Flashcard>;
    updateFlashcard(flashcardId: string, updateFlashcardDto: UpdateFlashcardRequest): Promise<Flashcard>;
    deleteFlashcard(flashcardId: string): Promise<void>;
    deleteManyByIds(ids: string[]): Promise<void>;
}
