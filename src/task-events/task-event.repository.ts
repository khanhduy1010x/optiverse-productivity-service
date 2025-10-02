import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TaskEvent } from './task-event.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateTaskEventRequest } from './dto/request/CreateTaskEventRequest.dto';
import { UpdateTaskEventRequest } from './dto/request/UpdateTaskEventRequest.dto';

@Injectable()
export class TaskEventRepository {
  constructor(@InjectModel(TaskEvent.name) private readonly taskEventModel: Model<TaskEvent>) {}

  async getTaskEventsByTaskID(taskId: string): Promise<TaskEvent[]> {
    return await this.taskEventModel.find({ task_id: new Types.ObjectId(taskId) }).exec();
  }

  async getTaskEventsByUserID(userId: string): Promise<TaskEvent[]> {
    return await this.taskEventModel
      .aggregate([
        {
          $lookup: {
            from: 'tasks',
            localField: 'task_id',
            foreignField: '_id',
            as: 'task',
          },
        },
        { $unwind: '$task' },
        { $match: { 'task.user_id': new Types.ObjectId(userId) } },
        {
          $project: {
            _id: 1,
            task_id: 1,
            title: 1,
            description: 1,
            start_time: 1,
            end_time: 1,
            all_day: 1,
            repeat_type: 1,
            repeat_interval: 1,
            repeat_days: 1,
            repeat_end_type: 1,
            repeat_end_date: 1,
            repeat_occurrences: 1,
            location: 1,
            guests: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ])
      .exec();
  }

  async createTaskEvent(createTaskEventDto: CreateTaskEventRequest): Promise<TaskEvent> {
    const newTaskEvent = new this.taskEventModel({
      task_id: new Types.ObjectId(createTaskEventDto.task_id),
      title: createTaskEventDto.title || 'Untitled Event',
      description: createTaskEventDto.description || '',
      start_time: createTaskEventDto.start_time,
      end_time: createTaskEventDto.end_time,
      repeat_type: createTaskEventDto.repeat_type,
      repeat_interval: createTaskEventDto.repeat_interval,
      repeat_end_date: createTaskEventDto.repeat_end_date
    });
    return await newTaskEvent.save();
  }

  async updateTaskEvent(
    taskEventId: string,
    updateTaskEventDto: UpdateTaskEventRequest,
  ): Promise<TaskEvent> {
    return await this.taskEventModel
      .findByIdAndUpdate(new Types.ObjectId(taskEventId), updateTaskEventDto, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteTaskEvent(taskEventId: string): Promise<void> {
    const result = await this.taskEventModel
      .deleteOne({ _id: new Types.ObjectId(taskEventId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }
}
