import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { ApiResponse } from 'src/common/api-response';
import { FlashcardResponse } from './dto/response/FlashcardResponse.dto';
import { CreateFlashcardRequest } from './dto/request/CreateFlashcardRequest.dto';
import { UpdateFlashcardRequest } from './dto/request/UpdateFlashcardRequest.dto';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiBearerAuth('access-token')
@Controller('/flashcard')
export class FlashcardController {
  
}
