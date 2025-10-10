import { Injectable } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { Task } from './task.schema';
import { GetAllTaskReponse } from './dto/response/GetAllTaskRepose.dto';
import { TaskResponse } from './dto/response/TaskReponse.dto';
import { CreateTaskRequest } from './dto/request/CreateTaskRequest.dto';
import { UpdateTaskRequest } from './dto/request/UpdateTaskRequest.dto';
import { TaskTagService } from '../task-tags/task-tag.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly taskTagService: TaskTagService,
  ) {}

  async getAllTaskByID(id: string): Promise<GetAllTaskReponse> {
    return await this.taskRepository.getAllTaskByID(id);
  }
  async getTaskByID(taskId: string): Promise<TaskResponse> {
    const task = await this.taskRepository.getTaskByID(taskId);
    return new TaskResponse(task);
  }

  async createTask(userId: string, createTaskDto: CreateTaskRequest): Promise<TaskResponse> {
    // Validate time rules according to frontend
    const start = createTaskDto.start_time ? new Date(createTaskDto.start_time) : undefined;
    const end = createTaskDto.end_time ? new Date(createTaskDto.end_time) : undefined;

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
        throw new BadRequestException({ statusCode: 400, message: 'Deadline must be after start time' });
      }
    }

    const task = await this.taskRepository.createTask(userId, createTaskDto);
    return new TaskResponse(task);
  }

  async updateTask(taskId: string, updateTaskDto: UpdateTaskRequest): Promise<TaskResponse> {
    // Validate time rules according to frontend
    const start = updateTaskDto.start_time ? new Date(updateTaskDto.start_time) : undefined;
    const end = updateTaskDto.end_time ? new Date(updateTaskDto.end_time) : undefined;

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
        throw new BadRequestException({ statusCode: 400, message: 'Deadline must be after start time' });
      }
    }

    const task = await this.taskRepository.updateTask(taskId, updateTaskDto);
    return new TaskResponse(task);
  }

  async deleteTask(taskId: string): Promise<void> {
    const task = await this.taskRepository.deleteTask(taskId);

    await this.taskTagService.deleteMany({ task_id: task._id });
  }
}
