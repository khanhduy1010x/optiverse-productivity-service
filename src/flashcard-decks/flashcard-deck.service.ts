import { FlashcardService } from './../flashcards/flashcard.service';
import { Injectable } from '@nestjs/common';
import { FlashcardDeckRepository } from './flashcard-deck.repository';
import { FlashcardDeck } from './flashcard-deck.schema';
import { CreateFlashcardDeckRequest } from './dto/request/CreateFlashcardDeckRequest.dto';
import { UpdateFlashcardDeckRequest } from './dto/request/UpdateFlashcardDeckRequest.dto';
import { FlashcardDeckResponse } from './dto/response/FlashcardDeckResponse.dto';
import { FlashcardRepository } from '../flashcards/flashcard.repository';

@Injectable()
export class FlashcardDeckService {
  
}
