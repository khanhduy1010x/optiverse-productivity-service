import { ApiProperty } from '@nestjs/swagger';
import { FlashcardDeckResponse } from '../response/FlashcardDeckResponse.dto';

export class GeneratedFlashcardsResponse {
  @ApiProperty()
  deck: FlashcardDeckResponse;

  @ApiProperty()
  flashcards: Array<{
    front: string;
    back: string;
  }>;

  @ApiProperty()
  message: string;

  constructor(deck: any, flashcards: any[], message: string) {
    this.deck = deck;
    this.flashcards = flashcards;
    this.message = message;
  }
}
