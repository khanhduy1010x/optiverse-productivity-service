import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TaskTag } from './task-tag.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateTaskTagRequest } from './dto/request/CreateTaskTagRequest.dto';
import { UpdateTaskTagRequest } from './dto/request/UpdateTaskTagRequest.dto';

@Injectable()
export class TaskTagRepository {
  constructor(@InjectModel(TaskTag.name) private readonly taskTagModel: Model<TaskTag>) {}

  async createTaskTag(createTaskTagDto: CreateTaskTagRequest): Promise<TaskTag> {
    const newTaskTag = new this.taskTagModel({
      task: new Types.ObjectId(createTaskTagDto.task_id),
      tag: new Types.ObjectId(createTaskTagDto.tag_id),
      created_at: new Date(),
      updated_at: new Date(),
    });
    const taskTag = await newTaskTag.save();
    return (await taskTag.populate('task')).populate('tag');
  }

  async deleteTaskTag(taskTagId: string): Promise<void> {
    const result = await this.taskTagModel.deleteOne({ _id: new Types.ObjectId(taskTagId) }).exec();
    if (result.deletedCount === 0) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }

  async deleteMany({
    task_id,
    tag_id,
  }: {
    task_id?: Types.ObjectId;
    tag_id?: Types.ObjectId;
  }): Promise<void> {
    if (task_id) {
      await this.taskTagModel.deleteMany({ task: task_id });
      return;
    }

    if (tag_id) {
      await this.taskTagModel.deleteMany({ tag: tag_id });
      return;
    }

    throw new AppException(ErrorCode.NOT_FOUND);
  }
}
