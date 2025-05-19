import { Flashcard } from '../../flashcard.schema';

export class FlashcardResponse {
  flashcard: Flashcard;

  constructor(flashcard: Flashcard) {
    this.flashcard = flashcard;
  }
}
