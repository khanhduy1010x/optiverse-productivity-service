import { Injectable } from '@nestjs/common';
import { FlashcardRepository } from './flashcard.repository';
import { Flashcard } from './flashcard.schema';
import { CreateFlashcardRequest } from './dto/request/CreateFlashcardRequest.dto';
import { UpdateFlashcardRequest } from './dto/request/UpdateFlashcardRequest.dto';
import { FlashcardResponse } from './dto/response/FlashcardResponse.dto';
import { ReviewSessionService } from '../review_sessions/review-session.service';

@Injectable()
export class FlashcardService {
  
}
