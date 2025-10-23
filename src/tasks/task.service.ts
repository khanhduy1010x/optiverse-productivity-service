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
    // No validation required - start_time and end_time are optional
    const task = await this.taskRepository.createTask(userId, createTaskDto);
    return new TaskResponse(task);
  }

  async updateTask(taskId: string, updateTaskDto: UpdateTaskRequest): Promise<TaskResponse> {
    // No validation required - start_time and end_time are optional
    const task = await this.taskRepository.updateTask(taskId, updateTaskDto);
    return new TaskResponse(task);
  }

  async deleteTask(taskId: string): Promise<void> {
    const task = await this.taskRepository.deleteTask(taskId);

    await this.taskTagService.deleteMany({ task_id: task._id });
  }
}
