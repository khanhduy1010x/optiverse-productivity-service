import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FocusSession } from './focus-session.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateFocusSessionRequest } from './dto/request/CreateFocusSessionRequest.dto';
import { UpdateFocusSessionRequest } from './dto/request/UpdateFocusSessionRequest.dto';

@Injectable()
export class FocusSessionRepository {
  
}
