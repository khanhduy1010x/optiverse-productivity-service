import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewSessionService } from './review-session.service';
import { ApiResponse } from 'src/common/api-response';
import { ReviewSessionResponse } from './dto/response/ReviewSessionResponse.dto';

import { ReviewRequestDto } from './dto/request/ReviewRequest.dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiBearerAuth('access-token')
@Controller('/review-session')
export class ReviewSessionController {
  
}
