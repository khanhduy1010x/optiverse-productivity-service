import { FlashcardDeck } from '../../flashcard-deck.schema';

export class FlashcardDeckResponse {
  flashcardDeck: FlashcardDeck;
  lastReview?: number;
  newCount?: number;
  learningCount?: number;
  reviewingCount?: number;

  constructor(
    flashcardDeck: FlashcardDeck,
    lastReview?: number,
    newCount?: number,
    learningCount?: number,
    reviewingCount?: number,
  ) {
    this.flashcardDeck = flashcardDeck;
    this.lastReview = lastReview;
    this.newCount = newCount;
    this.learningCount = learningCount;
    this.reviewingCount = reviewingCount;
  }
}
