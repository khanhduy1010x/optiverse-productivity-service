import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TaskEventService } from './task-event.service';
import { ApiResponse } from 'src/common/api-response';
import { TaskEventResponse } from './dto/response/TaskEventResponse.dto';
import { CreateTaskEventRequest } from './dto/request/CreateTaskEventRequest.dto';
import { UpdateTaskEventRequest } from './dto/request/UpdateTaskEventRequest.dto';
import { TaskEvent } from './task-event.schema';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiBearerAuth('access-token')
@Controller('/task-event')
export class TaskEventController {
  constructor(private readonly taskEventService: TaskEventService) {}

  @Get('task/:taskId')
  async getTaskEventsByTaskID(@Param('taskId') taskId: string): Promise<ApiResponse<TaskEvent[]>> {
    const taskEvents = await this.taskEventService.getTaskEventsByTaskID(taskId);
    return new ApiResponse<TaskEvent[]>(taskEvents);
  }

  // Lấy tất cả task-events theo userID (dựa vào userID nằm trong Task của mỗi event)
  @Get('user')
  async getAllByUser(@Request() req): Promise<ApiResponse<TaskEvent[]>> {
    const user = req.userInfo as UserDto;
    const events = await this.taskEventService.getTaskEventsByUserID(user.userId);
    return new ApiResponse<TaskEvent[]>(events);
  }

  @Post('create')
  async createTaskEvent(
    @Body() createTaskEventDto: CreateTaskEventRequest,
  ): Promise<ApiResponse<TaskEventResponse>> {
    const taskEvent = await this.taskEventService.createTaskEvent(createTaskEventDto);
    return new ApiResponse<TaskEventResponse>(taskEvent);
  }

  @Put('update/:id')
  async updateTaskEvent(
    @Param('id') taskEventId: string,
    @Body() updateTaskEventDto: UpdateTaskEventRequest,
  ): Promise<ApiResponse<TaskEventResponse>> {
    const taskEvent = await this.taskEventService.updateTaskEvent(taskEventId, updateTaskEventDto);
    return new ApiResponse<TaskEventResponse>(taskEvent);
  }

  @Delete('delete/:id')
  async deleteTaskEvent(@Param('id') taskEventId: string): Promise<ApiResponse<void>> {
    await this.taskEventService.deleteTaskEvent(taskEventId);
    return new ApiResponse<void>(null);
  }
}
