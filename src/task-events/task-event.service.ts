import { Injectable } from '@nestjs/common';
import { TaskEventRepository } from './task-event.repository';
import { TaskEvent } from './task-event.schema';
import { CreateTaskEventRequest } from './dto/request/CreateTaskEventRequest.dto';
import { UpdateTaskEventRequest } from './dto/request/UpdateTaskEventRequest.dto';
import { TaskEventResponse } from './dto/response/TaskEventResponse.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class TaskEventService {
  constructor(private readonly taskEventRepository: TaskEventRepository) {}

  async getTaskEventsByTaskID(taskId: string): Promise<TaskEvent[]> {
    return await this.taskEventRepository.getTaskEventsByTaskID(taskId);
  }

  async createTaskEvent(createTaskEventDto: CreateTaskEventRequest): Promise<TaskEventResponse> {
    // Validate time rules similar to Task
    const start = createTaskEventDto.start_time ? new Date(createTaskEventDto.start_time) : undefined;
    const end = createTaskEventDto.end_time ? new Date(createTaskEventDto.end_time) : undefined;

    if (!start || isNaN(start.getTime())) {
      throw new BadRequestException({ statusCode: 400, message: 'Invalid start time' });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    if (startDateOnly < today) {
      throw new BadRequestException({ statusCode: 400, message: 'Start date cannot be in the past' });
    }

    if (end) {
      if (isNaN(end.getTime())) {
        throw new BadRequestException({ statusCode: 400, message: 'Invalid end time' });
      }
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      if (endDateOnly < today) {
        throw new BadRequestException({ statusCode: 400, message: 'End date cannot be in the past' });
      }
      if (end <= start) {
        throw new BadRequestException({ statusCode: 400, message: 'End time must be after start time' });
      }
    }

    const taskEvent = await this.taskEventRepository.createTaskEvent(createTaskEventDto);
    return new TaskEventResponse(taskEvent);
  }

  async updateTaskEvent(
    taskEventId: string,
    updateTaskEventDto: UpdateTaskEventRequest,
  ): Promise<TaskEventResponse> {
    // Validate time rules similar to Task
    const start = updateTaskEventDto.start_time ? new Date(updateTaskEventDto.start_time) : undefined;
    const end = updateTaskEventDto.end_time ? new Date(updateTaskEventDto.end_time) : undefined;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (start) {
      if (isNaN(start.getTime())) {
        throw new BadRequestException({ statusCode: 400, message: 'Invalid start time' });
      }
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      if (startDateOnly < today) {
        throw new BadRequestException({ statusCode: 400, message: 'Start date cannot be in the past' });
      }
    }

    if (end) {
      if (isNaN(end.getTime())) {
        throw new BadRequestException({ statusCode: 400, message: 'Invalid end time' });
      }
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      if (endDateOnly < today) {
        throw new BadRequestException({ statusCode: 400, message: 'End date cannot be in the past' });
      }

      if (start && end <= start) {
        throw new BadRequestException({ statusCode: 400, message: 'End time must be after start time' });
      }
    }

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
