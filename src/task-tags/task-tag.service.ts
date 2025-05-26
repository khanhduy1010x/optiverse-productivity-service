import { Injectable } from '@nestjs/common';
import { TaskTagRepository } from './task-tag.repository';
import { TaskTag } from './task-tag.schema';
import { CreateTaskTagRequest } from './dto/request/CreateTaskTagRequest.dto';
import { UpdateTaskTagRequest } from './dto/request/UpdateTaskTagRequest.dto';
import { TaskTagResponse } from './dto/response/TaskTagResponse.dto';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { Types } from 'mongoose';

@Injectable()
export class TaskTagService {
  constructor(private readonly taskTagRepository: TaskTagRepository) {}

  async createTaskTag(createTaskTagDto: CreateTaskTagRequest): Promise<TaskTagResponse> {
    const taskTag = await this.taskTagRepository.createTaskTag(createTaskTagDto);
    return new TaskTagResponse(taskTag);
  }

  async deleteTaskTag(taskTagId: string): Promise<void> {
    return await this.taskTagRepository.deleteTaskTag(taskTagId);
  }

  async deleteMany({
    task_id,
    tag_id,
  }: {
    task_id?: Types.ObjectId;
    tag_id?: Types.ObjectId;
  }): Promise<void> {
    await this.taskTagRepository.deleteMany({ task_id, tag_id });
  }
}
