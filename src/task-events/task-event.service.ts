import { Injectable } from '@nestjs/common';
import { TaskEventRepository } from './task-event.repository';
import { TaskEvent } from './task-event.schema';
import { CreateTaskEventRequest } from './dto/request/CreateTaskEventRequest.dto';
import { UpdateTaskEventRequest } from './dto/request/UpdateTaskEventRequest.dto';
import { TaskEventResponse } from './dto/response/TaskEventResponse.dto';

@Injectable()
export class TaskEventService {
  
}
