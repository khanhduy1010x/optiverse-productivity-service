import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FlashcardDeck } from './flashcard-deck.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateFlashcardDeckRequest } from './dto/request/CreateFlashcardDeckRequest.dto';
import { UpdateFlashcardDeckRequest } from './dto/request/UpdateFlashcardDeckRequest.dto';
import { FlashcardDeckResponse } from './dto/response/FlashcardDeckResponse.dto';

@Injectable()
export class FlashcardDeckRepository {
  
}
