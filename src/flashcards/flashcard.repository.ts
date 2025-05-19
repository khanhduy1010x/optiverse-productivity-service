import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Flashcard } from './flashcard.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateFlashcardRequest } from './dto/request/CreateFlashcardRequest.dto';
import { UpdateFlashcardRequest } from './dto/request/UpdateFlashcardRequest.dto';

@Injectable()
export class FlashcardRepository {
  
}
