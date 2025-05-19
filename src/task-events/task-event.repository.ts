import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TaskEvent } from './task-event.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateTaskEventRequest } from './dto/request/CreateTaskEventRequest.dto';
import { UpdateTaskEventRequest } from './dto/request/UpdateTaskEventRequest.dto';

@Injectable()
export class TaskEventRepository {
  
}
