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
  constructor(private readonly taskService: TaskService) {}

  @Get('all')
  async getAllTaskUser(@Request() req): Promise<ApiResponseWrapper<GetAllTaskReponse>> {
    const user = req.user as UserDto;
    const result = await this.taskService.getAllTaskByID(user.userId);
    return new ApiResponseWrapper<GetAllTaskReponse>(result);
  }
  @Get(':id')
  async getTaskById(@Param('id') taskId: string): Promise<ApiResponseWrapper<TaskResponse>> {
    const task = await this.taskService.getTaskByID(taskId);
    return new ApiResponseWrapper<TaskResponse>(task);
  }

  @ApiBody({ type: CreateTaskRequest })
  @ApiOkResponse({
    description: 'Create task successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseWrapper) },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(TaskResponse) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Created failed' })
  @Post('')
  async createTask(
    @Request() req,
    @Body() createTaskDto: CreateTaskRequest,
  ): Promise<ApiResponseWrapper<TaskResponse>> {
    const user = req.user as UserDto;
    const task = await this.taskService.createTask(user.userId, createTaskDto);
    return new ApiResponseWrapper<TaskResponse>(task);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiBody({ type: UpdateTaskRequest })
  @ApiOkResponse({
    description: 'Update task successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseWrapper) },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(TaskResponse) },
          },
        },
      ],
    },
  })
  @Put('/:id')
  async updateTask(
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskRequest,
  ): Promise<ApiResponseWrapper<TaskResponse>> {
    const task = await this.taskService.updateTask(taskId, updateTaskDto);
    return new ApiResponseWrapper<TaskResponse>(task);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Delete('/:id')
  async deleteTask(@Param('id') taskId: string): Promise<ApiResponseWrapper<void>> {
    await this.taskService.deleteTask(taskId);
    return new ApiResponseWrapper<void>(null);
  }
}
