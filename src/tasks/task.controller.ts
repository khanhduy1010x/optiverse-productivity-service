import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { GetAllTaskReponse } from './dto/response/GetAllTaskRepose.dto';
import { TaskResponse } from './dto/response/TaskReponse.dto';
import { CreateTaskRequest } from './dto/request/CreateTaskRequest.dto';
import { UpdateTaskRequest } from './dto/request/UpdateTaskRequest.dto';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiTags('Task')
@ApiBearerAuth('access-token')
@ApiExtraModels(ApiResponseWrapper, TaskResponse)
@Controller('/task')
export class TaskController {
  
}
