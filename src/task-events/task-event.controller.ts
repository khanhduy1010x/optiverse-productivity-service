import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TaskEventService } from './task-event.service';
import { ApiResponse } from 'src/common/api-response';
import { TaskEventResponse } from './dto/response/TaskEventResponse.dto';
import { CreateTaskEventRequest } from './dto/request/CreateTaskEventRequest.dto';
import { UpdateTaskEventRequest } from './dto/request/UpdateTaskEventRequest.dto';
import { TaskEvent } from './task-event.schema';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('/task-event')
export class TaskEventController {
  
}
