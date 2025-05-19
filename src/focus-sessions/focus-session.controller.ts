import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FocusSessionService } from './focus-session.service';
import { ApiResponse } from 'src/common/api-response';
import { FocusSessionResponse } from './dto/response/FocusSessionResponse.dto';
import { CreateFocusSessionRequest } from './dto/request/CreateFocusSessionRequest.dto';
import { UpdateFocusSessionRequest } from './dto/request/UpdateFocusSessionRequest.dto';
import { FocusSession } from './focus-session.schema';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiBearerAuth('access-token')
@Controller('/focus-session')
export class FocusSessionController {
  
}
