import { Injectable } from '@nestjs/common';
import { FocusSessionRepository } from './focus-session.repository';
import { FocusSession } from './focus-session.schema';
import { CreateFocusSessionRequest } from './dto/request/CreateFocusSessionRequest.dto';
import { UpdateFocusSessionRequest } from './dto/request/UpdateFocusSessionRequest.dto';
import { FocusSessionResponse } from './dto/response/FocusSessionResponse.dto';

@Injectable()
export class FocusSessionService {
  
}
