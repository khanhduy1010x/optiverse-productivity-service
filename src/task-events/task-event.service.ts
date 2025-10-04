import { Injectable } from '@nestjs/common';
import { TaskEventRepository } from './task-event.repository';
import { TaskEvent } from './task-event.schema';
import { CreateTaskEventRequest } from './dto/request/CreateTaskEventRequest.dto';
import { UpdateTaskEventRequest } from './dto/request/UpdateTaskEventRequest.dto';
import { TaskEventResponse } from './dto/response/TaskEventResponse.dto';

@Injectable()
export class TaskEventService {
  constructor(private readonly taskEventRepository: TaskEventRepository) {}

  async getTaskEventsByTaskID(taskId: string): Promise<TaskEvent[]> {
    return await this.taskEventRepository.getTaskEventsByTaskID(taskId);
  }

  async createTaskEvent(createTaskEventDto: CreateTaskEventRequest): Promise<TaskEventResponse> {
    const taskEvent = await this.taskEventRepository.createTaskEvent(createTaskEventDto);
    return new TaskEventResponse(taskEvent);
  }

  async updateTaskEvent(
    taskEventId: string,
    updateTaskEventDto: UpdateTaskEventRequest,
  ): Promise<TaskEventResponse> {
    const taskEvent = await this.taskEventRepository.updateTaskEvent(
      taskEventId,
      updateTaskEventDto,
    );
    return new TaskEventResponse(taskEvent);
  }

  async deleteTaskEvent(taskEventId: string): Promise<void> {
    return await this.taskEventRepository.deleteTaskEvent(taskEventId);
  }

  /**
   * Get all task events associated with the current user
   */
  async getTaskEventsByUserID(userId: string): Promise<TaskEventResponse[]> {
    const events = await this.taskEventRepository.getTaskEventsByUserID(userId);
    return events.map(ev => new TaskEventResponse(ev));
  }
}
