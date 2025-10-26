import { FlashcardDeck } from '../../flashcard-deck.schema';
export declare class FlashcardDeckResponse {
    flashcardDeck: FlashcardDeck;
    lastReview?: number;
    newCount?: number;
    learningCount?: number;
    reviewingCount?: number;
    constructor(flashcardDeck: FlashcardDeck, lastReview?: number, newCount?: number, learningCount?: number, reviewingCount?: number);
}
